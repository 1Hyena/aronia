"use strict";

function get_esc_nonblocking_length(txt) {
    for (let i = 0, length = txt.length; i < length; ++i) {
        if (txt[i] != 27) {
            continue;
        }

        return i;
    }

    return txt.length;
}

function get_esc_sequence_length(data, start, size) {
    var esc_active = false;
    var i = start;

    for (; i < start + size; ++i) {
        if (!esc_active) {
            if (data[i] == 27) {
                esc_active = true;

                continue;
            }

            return 0;
        }

        switch (data[i]) {
            case 32: { // space
                let j = i + 1;

                if (j < start + size) {
                    let seqlen = j - start + 1;
                    let c = data[j];

                    if (c === "M".charCodeAt(0)
                    ||  c === "7".charCodeAt(0)
                    ||  c === "8".charCodeAt(0)) {
                        return seqlen;
                    }
                    else return 1; // invalid sequence
                }

                return 0; // impartial sequence
            }
            case 91: { // [
                for (let j=i+1; j < start + size ; ++j) {
                    let seqlen = j - start + 1;
                    let c = data[j];

                    if (c !== ";".charCodeAt(0)
                    && (c < "0".charCodeAt(0) || c > "9".charCodeAt(0))) {
                        if (c === "m".charCodeAt(0) // colors
                        ||  c === "n".charCodeAt(0) // request cursor position
                        ||  c === "H".charCodeAt(0) // move cursor
                        ||  c === "J".charCodeAt(0) // erasing
                        ||  c === "K".charCodeAt(0) // erasing
                        ||  c === "f".charCodeAt(0)) { // move cursor
                            return seqlen;
                        }
                        else if (c === "#".charCodeAt(0)) { // move cursor
                            if (j + 1 < start + size) {
                                return seqlen + 1;
                            }
                            else return 0;
                        }
                        else if (c === "H".charCodeAt(0)
                        || c === "J".charCodeAt(0)
                        || c === "K".charCodeAt(0)
                        || c === "s".charCodeAt(0)
                        || c === "u".charCodeAt(0)) {
                            if (seqlen === 3) {
                                return seqlen;
                            }
                        }
                        else { // unknown sequence
                            return 1;
                        }
                    }
                }

                return 0; // impartial sequence
            }
            default: break;
        }

        return 1; // unknown sequence
    }

    return 0; // impartial sequence
}

function amc_handle_log(data) {
    if (data.length === 0) {
        return;
    }

    global.mud.log.data.push(...data);

    data = global.mud.log.data;
    global.mud.log.data = [];

    do {
        if (!data.length) {
            return;
        }

        var nonblocking_length = get_esc_nonblocking_length(data);
        var blocked_length = data.length - nonblocking_length;

        if (nonblocking_length > 0) {
            global.mud.incoming.info.push(
                make_info_packet("txt", data, 0, nonblocking_length)
            );
        }

        var total_esc_length = 0;

        do {
            var esc_length = get_esc_sequence_length(
                data, nonblocking_length + total_esc_length,
                blocked_length - total_esc_length
            );

            if (!esc_length) {
                break;
            }

            global.mud.incoming.info.push(
                make_info_packet(
                    "esc", data,
                    nonblocking_length + total_esc_length, esc_length
                )
            );

            total_esc_length += esc_length;
        } while (true);

        data = data.slice(nonblocking_length + total_esc_length);

        if (!total_esc_length) {
            break;
        }
    } while (true);

    data.push(...global.mud.log.data);
    global.mud.log.data = data;
}

function amc_handle_iac(data) {
    if (data.length === 2) {
        if (data[0] !== netio.IAC) {
            bug();
            return;
        }

        if (data[1] === netio.EOR) {
            amc_flush_printer();
        }
    }
    else if (data.length === 3) {
        if (data[0] !== netio.IAC) {
            bug();
            return;
        }

        if (data[1] === netio.WILL && data[2] === netio.TELOPT_EOR) {
            amc_send_bytes([ netio.IAC, netio.DO, netio.TELOPT_EOR ]);

            netio.server.eor = true;
        }
        else if (data[1] === netio.WILL && data[2] === netio.MSDP) {
            amc_send_bytes([ netio.IAC, netio.DO, netio.MSDP ]);

            netio.server.msdp = true;
            msdp_handler();
        }
        else if (data[1] === netio.WILL) {
            amc_send_bytes([ netio.IAC, netio.DONT, data[2] ]);
        }
    }
    else if (data.length > 5) {
        if (data[0] !== netio.IAC) {
            bug();
            return;
        }

        if (data[1] === netio.SB
        &&  data[2] === netio.MSDP
        &&  data[data.length-2] === netio.IAC
        &&  data[data.length-1] === netio.SE) {
            msdp.incoming.push(data);
            msdp_handler();
        }
    }
}

function amc_handle_txt(data) {
    global.mud.log.text.data.push(...data);

    if (global.mud.log.text.data.length <= 0) {
        return;
    }

    data = new Uint8Array(global.mud.log.text.data);

    global.mud.log.text.data = [];

    let unicode = global.mud.log.text.utf8.decoder.decode(data, {stream: true});

    if (unicode.length > 0) {
        global.mud.log.text.utf8.time = Date.now();

        let list = global.mud.log.ansi;
        let ansi = {};

        for (const [key, value] of Object.entries(list)) {
            ansi[key] = list[key];
        }

        global.mud.log.text.utf8.packets.push(
            {
                ansi : ansi,
                data : [...unicode]
            }
        );
    }
}

function amc_handle_esc(data) {
    if (data.length > 3) {
        if (data[0] === 27
        &&  data[1] === 91
        &&  data[data.length - 1] === 109) {
            let parts = String.fromCharCode(
                ...data.slice(2, data.length - 1)
            ).split(";");

            for (let i=0; i<parts.length; ++i) {
                let num = parseInt(parts[i], 10);

                switch (num) {
                    case 0: { // reset all
                        let list = global.mud.log.ansi;

                        for (const [key, value] of Object.entries(list)) {
                            list[key] = null;
                        }

                        break;
                    }
                    case 1: {
                        global.mud.log.ansi.bold = true;
                        break;
                    }
                    case 2: {
                        global.mud.log.ansi.faint = true;
                        break;
                    }
                    case 3: {
                        global.mud.log.ansi.italic = true;
                        break;
                    }
                    case 4: {
                        global.mud.log.ansi.underline = true;
                        break;
                    }
                    case 5: {
                        global.mud.log.ansi.blinking = true;
                        break;
                    }
                    case 7: {
                        global.mud.log.ansi.reverse = true;
                        break;
                    }
                    case 8: {
                        global.mud.log.ansi.hidden = true;
                        break;
                    }
                    case 9: {
                        global.mud.log.ansi.strikethrough = true;
                        break;
                    }
                    case 22: {
                        global.mud.log.ansi.bold = null;
                        global.mud.log.ansi.faint = null;
                    }
                    case 23: {
                        global.mud.log.ansi.italic = null;
                    }
                    case 24: {
                        global.mud.log.ansi.underline = null;
                    }
                    case 25: {
                        global.mud.log.ansi.blinking = null;
                    }
                    case 27: {
                        global.mud.log.ansi.reverse = null;
                    }
                    case 28: {
                        global.mud.log.ansi.hidden = null;
                        break;
                    }
                    case 29: {
                        global.mud.log.ansi.strikethrough = null;
                        break;
                    }
                    case 30: {
                        global.mud.log.ansi.fg = "black";
                        break;
                    }
                    case 31: {
                        global.mud.log.ansi.fg = "red";
                        break;
                    }
                    case 32: {
                        global.mud.log.ansi.fg = "green";
                        break;
                    }
                    case 33: {
                        global.mud.log.ansi.fg = "yellow";
                        break;
                    }
                    case 34: {
                        global.mud.log.ansi.fg = "blue";
                        break;
                    }
                    case 35: {
                        global.mud.log.ansi.fg = "magenta";
                        break;
                    }
                    case 36: {
                        global.mud.log.ansi.fg = "cyan";
                        break;
                    }
                    case 37: {
                        global.mud.log.ansi.fg = "white";
                        break;
                    }
                    case 39: {
                        global.mud.log.ansi.fg = "default";
                        break;
                    }
                    default: break;
                }
            }
        }
    }
}

function amc_read_incoming() {
    receive_from_incoming(global.mud.incoming);

    do {
        let incoming_info = global.mud.incoming.info;
        global.mud.incoming.info = [];

        for (var i=0, sz = incoming_info.length; i<sz; ++i) {
            if (global.mud.incoming.info.length > 0) {
                global.mud.incoming.info.push(incoming_info[i]);

                continue;
            }

            switch (incoming_info[i].type) {
                case "log": {
                    amc_handle_log(incoming_info[i].data);
                    break;
                }
                case "iac": {
                    amc_handle_iac(incoming_info[i].data);
                    break;
                }
                case "txt": {
                    amc_handle_txt(incoming_info[i].data);
                    break;
                }
                case "esc": {
                    amc_handle_esc(incoming_info[i].data);
                    break;
                }
                default: continue;
            }
        }
    } while (global.mud.incoming.info.length > 0);

    if (global.mud.log.text.utf8.packets.length > 0) {
        amc_print_log();

        if (global.mud.log.text.utf8.packets.length > 0) {
            setTimeout(
                function() {
                    if (global.mud.log.text.utf8.packets.length > 0
                    && (Date.now()-global.mud.log.text.utf8.time) > 250) {
                        amc_flush_printer();
                        amc_update_terminal();
                    }
                }, 500
            );
        }
    }

    setTimeout(
        function() {
            amc_update_terminal();
        }, 1
    );
}

function amc_optimize_terminal() {
    let color_history_lines = 100;
    let plain_history_lines = 1000;
    //console.log("optimizing terminal");

    let output = (
        global.offscreen.terminal || document.getElementById("amc-terminal")
    );

    if (output === global.offscreen.terminal) {
        return;
    }

    let children = output.childNodes;
    let first_visible = null;
    let keep_nodes = [];
    let stash_nodes = [];
    let breakpoints = [];

    for (let i = 0; i < children.length; i++) {
        let child = children[i];

        if (child.nodeType === Node.ELEMENT_NODE) {
            if (is_visible(output.parentNode, child, true)) {
                first_visible = child;
                break;
            }
        }
        else {
            if (child.nodeType === Node.COMMENT_NODE) {
                if (child.nodeValue === "breakpoint") {
                    breakpoints.push(i);
                }
            }
        }
    }

    for (let i = 0; i < color_history_lines; ++i) {
        if (breakpoints.length === 0) {
            break;
        }

        breakpoints.pop();
    }

    let stash_before = breakpoints.length === 0 ? 0 : breakpoints.pop();

    for (let i = 0; i < children.length; ++i) {
        let child = children[i];

        if (i < stash_before) {
            stash_nodes.push(child);
            continue;
        }

        keep_nodes.push(child);
    }

    output.replaceChildren(...keep_nodes);

    if (stash_nodes.length === 0) {
        return;
    }

    let strings = [];

    for (let i = 0; i < stash_nodes.length; ++i) {
        let child = stash_nodes[i];

        if (child.nodeType === Node.ELEMENT_NODE
        && child.tagName.toLowerCase() == 'span') {
            strings.push(child.textContent);
        }
        else if (child.nodeType === Node.TEXT_NODE) {
            strings.push(child.textContent);
        }
    }

    let lines = strings.join("").split("\n");

    output.prepend(
        document.createTextNode(
            lines.slice(
                Math.max(lines.length - plain_history_lines, 0)
            ).join("\n")
        )
    );
}

function amc_update_terminal() {
    if (global.mud.log.buffer === null) {
        return;
    }

    let output = (
        global.offscreen.terminal || document.getElementById("amc-terminal")
    );

    let bottom = (
        output.parentNode ? is_scrolled_bottom(output.parentNode) : false
    );

    let children = global.mud.log.buffer.childNodes;

    // Let's cut heads and tails to enable smooth color transitions.
    let fg = [];

    for (let i = 0; i < children.length; i++) {
        let child = children[i];

        if (child.nodeType !== Node.ELEMENT_NODE) {
            continue;
        }

        if (child.tagName.toLowerCase() != 'span'
        || child.children.length > 0
        || !child.classList.contains("ans-fg")) {
            continue;
        }

        fg.push(child);
    }

    for (let i = 0; i < fg.length; i++) {
        let child = fg[i];

        if (child.classList.contains("ans-italic")
        || !global.mud.log.settings.lerp) {
            // Text gradient disabled for italic texts because it would
            // clip too soon.
            continue;
        }

        let symbols = [...child.textContent];

        if (symbols.length <= 1) {
            if (symbols.length === 1 && symbols[0].trim()) {
                child.classList.add("ans-lerp");
            }

            continue;
        }

        if (symbols[0].trim()) {
            let head = symbols.shift();
            let span = document.createElement("span");

            span.appendChild(document.createTextNode(head));
            span.classList = child.classList;
            span.classList.add("ans-lerp");
            span.setAttribute("data-fg", child.getAttribute("data-fg"));
            global.mud.log.buffer.insertBefore(span, child);
        }

        if (symbols.length > 1 && symbols[symbols.length - 1].trim()) {
            let tail = symbols.pop();
            let span = document.createElement("span");

            span.appendChild(document.createTextNode(tail));
            span.classList = child.classList;
            span.classList.add("ans-lerp");
            span.setAttribute("data-fg", child.getAttribute("data-fg"));
            child.after(span);
        }

        if (symbols.length === 1 && symbols[0].trim()) {
            child.classList.add("ans-lerp");
        }

        child.textContent = symbols.join("");
    }

    let elements = global.mud.log.buffer.children;

    for (let i=0; i<elements.length; ++i) {
        let el = elements[i];

        if (!el.classList.contains("ans-lerp")) {
            continue;
        }

        let el_prev = el.previousElementSibling;
        let el_next = el.nextElementSibling;

        if (el_next !== null
        &&  el_prev !== null
        &&  el_next.classList.contains("ans-lerp")
        &&  el_prev.classList.contains("ans-lerp")
        &&  el_prev.getAttribute("data-fg") != el.getAttribute("data-fg")
        &&  el_next.getAttribute("data-fg") != el.getAttribute("data-fg")) {
            el.classList.add(
                "ans-lerp-"+el_prev.getAttribute("data-fg")+
                "-to-"+el.getAttribute("data-fg")+
                "-to-"+el_next.getAttribute("data-fg")
            );

            continue;
        }

        if (el_next !== null
        &&  el_next.classList.contains("ans-lerp")
        &&  el_next.getAttribute("data-fg") != el.getAttribute("data-fg")) {
            el.classList.add(
                "ans-lerp-"+el.getAttribute("data-fg")+
                "-to-"+el_next.getAttribute("data-fg")+"-l"
            );

            continue;
        }

        if (el_prev !== null
        &&  el_prev.classList.contains("ans-lerp")
        &&  el_prev.getAttribute("data-fg") != el.getAttribute("data-fg")) {
            el.classList.add(
                "ans-lerp-"+el_prev.getAttribute("data-fg")+
                "-to-"+el.getAttribute("data-fg")+"-r"
            );

            continue;
        }

        if (el.classList.contains("ans-lerp")) {
            el.classList.remove("ans-lerp");
        }
    }

    let input_first = global.mud.log.buffer.firstChild;
    let output_last = output.lastChild;

    if (input_first !== null
    && output_last  !== null
    && output_last.nodeType === Node.ELEMENT_NODE
    && input_first.nodeType === Node.ELEMENT_NODE
    && output_last.tagName.toLowerCase() === 'span'
    && input_first.tagName.toLowerCase() === 'span'
    && output_last.children.length === 0
    && input_first.children.length === 0
    && is_same_classlist(output_last, input_first)) {
        global.mud.log.buffer.removeChild(input_first);

        let input_fragment = new DocumentFragment();

        while (input_first.childNodes.length > 0) {
            input_fragment.appendChild(input_first.firstChild);
        }

        output_last.appendChild(input_fragment);
        output_last.normalize();

        if (global.mud.log.buffer.childNodes.length > 0) {
            setTimeout(
                function() {
                    amc_update_terminal();
                }, 1
            );

            return;
        }
        else {
            global.mud.log.buffer = null;
        }
    }
    else {
        let buffer = global.mud.log.buffer;

        global.mud.log.buffer = null;
        output.appendChild(buffer);
    }

    if (bottom) {
        scroll_to_bottom("amc-terminal-wrapper", amc_optimize_terminal);
    }
}

function amc_match_login_line(line) {
    var expressions = [];

    switch (global.mud.state) {
        case "": {
            expressions.push("(^Login)( )(> $)");
            break;
        }
        case "login": {
            expressions.push("(^)(Please enter password.)($)");
            break;
        }
        case "login-sending-username": {
            expressions.push("(^)(Please enter password.)($)");
            break;
        }
        case "login-manual": {
            expressions.push("(^)( Account Menu:)($)");
            break;
        }
        case "login-wrong-password":
        case "login-sending-password": {
            expressions.push("(^)( Account Menu:)($)");
            expressions.push("(^)(Do you wish to connect anyway\\?)($)");
            expressions.push("(^)(Wrong password\\! Try again\\.)($)");
            break;
        }
        default: break;
    }

    if (expressions.length === 0) {
        return;
    }

    for (var i=0; i<expressions.length; ++i) {
        var regex = new RegExp(expressions[i]);
        var match = regex.exec(line) || [];

        if (match.length !== 4) {
            continue;
        }

        switch (global.mud.state) {
            case "": {
                global.mud.state = "login";
                break;
            }
            case "login": {
                global.mud.state = "login-manual";
                break;
            }
            case "login-sending-username": {
                global.mud.state = "login-sending-password";
                amc_send_command(global.mud.account.password);
                break;
            }
            case "login-wrong-password":
            case "login-sending-password": {
                if (i === 1) {
                    amc_send_command("yes");
                    break;
                }
                else if (i === 2) {
                    global.mud.state = "login-wrong-password";
                    break;
                }

                global.mud.state = "account-menu";
                break;
            }
            case "login-manual": {
                global.mud.state = "account-menu";
                break;
            }
            default: break;
        }
    }
}

function amc_match_public_chat(line) {
    var regex = new RegExp(
        "(^(?:.* > )?)(.+) (gossip[s]?|narrate[s]?|chat[s]?|yell[s]?|say[s]?|"+
        "exclaim[s]?|ask[s]?|state[s]?|chats in the lobby) '(.+)(['][.]?.*$)"
    );

    var match = regex.exec(line) || [];

    if (match.length !== 6) {
        return false;
    }

    var author = match[2];
    var channel = match[3];
    var content = match[4];

    var message = document.createElement("div");
    var span1 = document.createElement("span");
    var span2 = document.createElement("span");
    var span3 = document.createElement("span");
    var span4 = document.createElement("span");

    span1.appendChild(
        document.createTextNode(
            "["+get_timestring(get_timestamp()).split(" ").pop()+"] "
        )
    );

    span2.appendChild(document.createTextNode(author));
    span3.appendChild(document.createTextNode(" "+channel+": "));
    span4.appendChild(document.createTextNode(content));

    message.append(span1, span2, span3, span4);
    message.classList.add("amc-chat-public");
    message.setAttribute("data-author", author);

    var chat = (
        global.offscreen.chatview || document.getElementById("amc-chatview")
    );

    var bottom = is_scrolled_bottom(chat.parentNode);

    chat.appendChild(message);

    if (bottom) {
        scroll_to_bottom("amc-chatview-wrapper");
    }

    return true;
}

function amc_match_chat_line(line) {
    //line = strip_ansiesc(line);

    var regex = new RegExp(
        "(^(?:.* > )?)(.+) (?:tells|tell|whisper[s]? to) (.+) "+
        "'(.+)(['][.]?.*$)"
    );

    var match = regex.exec(line) || [];

    if (match.length !== 6) {
        return amc_match_public_chat(line);
    }

    var author = match[2];
    var target = match[3];
    var content = match[4];

    var message = document.createElement("div");
    var span1 = document.createElement("span");
    var span2 = document.createElement("span");
    var span3 = document.createElement("span");
    var span4 = document.createElement("span");

    span1.appendChild(
        document.createTextNode(
            "["+get_timestring(get_timestamp()).split(" ").pop()+"] "
        )
    );

    span2.appendChild(document.createTextNode(author));
    span3.appendChild(document.createTextNode(" to "+target+": "));
    span4.appendChild(document.createTextNode(content));

    message.append(span1, span2, span3, span4);
    message.classList.add("amc-chat-private");
    message.setAttribute("data-author", author);
    message.setAttribute("data-target", target);

    var chat = (
        global.offscreen.chatview || document.getElementById("amc-chatview")
    );

    var bottom = is_scrolled_bottom(chat.parentNode);

    chat.appendChild(message);

    if (bottom) {
        scroll_to_bottom("amc-chatview-wrapper");
    }

    return true;
}

/*function amc_match_ctrl_line(line) {
    var regex = new RegExp(
        "(^.*\\x1B\\[8m\\x1B\\]0;)(.+)(\\x07\\x1B\\[28m\\x1B\\[0m.*$)"
    );

    var match = regex.exec(line) || [];

    if (match.length !== 4) {
        return;
    }

    global.title = match[2];
}*/

function amc_match_line(line) {
    switch (global.mud.state) {
        case "":
        case "login":
        case "login-sending-username":
        case "login-manual":
        case "login-wrong-password":
        case "login-sending-password": {
            amc_match_login_line(line);
            break;
        }
        default: break;
    }

    amc_match_chat_line(line);
    //amc_match_ctrl_line(line);

    return;
}

function amc_flush_printer() {
    amc_print_log();

    if (global.mud.log.text.utf8.packets.length <= 0) {
        return;
    }

    let all = "";

    for (let i=0; i<global.mud.log.text.utf8.packets.length; ++i) {
        let str = global.mud.log.text.utf8.packets[i].data.join("");

        amc_print_to_buffer(str, global.mud.log.text.utf8.packets[i].ansi);
        all+=str;
    }

    global.mud.log.text.utf8.packets = [];

    amc_match_line(all);
}

function amc_print_log() {
    let packets = global.mud.log.text.utf8.packets;
    let split_packet = null;

    for (let i=packets.length - 1; i >= 0; --i) {
        for (let j=0, sz = packets[i].data.length; j<sz; ++j) {
            if (packets[i].data[j] === "\n") {
                split_packet = i;
                break;
            }
        }

        if (split_packet !== null) {
            break;
        }
    }

    if (split_packet === null) {
        return;
    }

    let line = [];

    for (let i=0; i<=split_packet; ++i) {
        let print_length = packets[i].data.length;

        for (let j=0, sz = packets[i].data.length; j<sz; ++j) {
            if (packets[i].data[j] !== "\n") {
                line.push(packets[i].data[j]);
                continue;
            }

            if (j + 1 < sz && packets[i].data[j + 1] === "\r") {
                ++j;
                line.push(packets[i].data[j]);
            }

            if (i === split_packet) {
                print_length = j + 1;
            }

            for (;;) {
                let char = line.pop();

                if (char !== "\n" && char !== "\r") {
                    line.push(char);
                    break;
                }

                if (line.length === 0) {
                    break;
                }
            }

            if (line.length > 0) {
                amc_match_line(line.join(""));
                line = [];
            }
        }

        let print = packets[i].data.splice(0, print_length);

        amc_print_to_buffer(print.join(""), packets[i].ansi);
    }

    if (packets[split_packet].data.length === 0) {
        packets.splice(0, split_packet + 1);
    }
    else {
        packets.splice(0, split_packet);
    }
}

function amc_print(string, ansi) {
    amc_print_to_buffer(string, ansi);
    amc_update_terminal();
}

function amc_print_to_buffer(string, ansi) {
    ansi = typeof ansi !== 'undefined' ? ansi : {};

    if (string.length === 0) {
        return;
    }

    if (global.mud.log.buffer === null) {
        global.mud.log.buffer = new DocumentFragment();
    }

    let output = global.mud.log.buffer;
    let plain = true;

    for (const [key, value] of Object.entries(ansi)) {
        if (ansi[key] !== null) {
            plain = false;
            break;
        }
    }

    string = string.split("\r").join("");

    let lines = string.split("\n");

    for (let i=0; i<lines.length; ++i) {
        string = lines[i];

        if (i + 1 < lines.length) {
            string += "\n";
        }
        else if (string === "") {
            continue;
        }

        let appendage = null;

        if (plain) {
            let span = document.createElement("span");
            span.appendChild(document.createTextNode(string));
            appendage = span;
        }
        else {
            let span = document.createElement("span");
            span.appendChild(document.createTextNode(string));

            if (ansi.fg !== null) {
                span.classList.add("ans-fg-"+ansi.fg);
                span.classList.add("ans-fg");

                if (ansi.bold === true) {
                    span.setAttribute("data-fg", "hi-"+ansi.fg);
                }
                else {
                    span.setAttribute("data-fg", ansi.fg);
                }
            }

            if (ansi.bold === true) {
                span.classList.add("ans-b");
            }

            if (ansi.italic === true) {
                span.classList.add("ans-italic");
            }

            if (ansi.faint === true) {
                span.classList.add("ans-faint");
            }

            if (ansi.underline === true) {
                span.classList.add("ans-underline");
            }

            if (ansi.reverse === true) {
                span.classList.add("ans-reverse");
            }

            if (ansi.blinking === true) {
                span.classList.add("ans-blinking");
            }

            if (ansi.strikethrough === true) {
                span.classList.add("ans-strikethrough");
            }

            if (ansi.hidden === true) {
                span.classList.add("ans-hidden");
            }

            appendage = span;
        }

        if (appendage !== null) {
            let output_last = output.lastChild;

            if (output_last
            && appendage.nodeType                   === Node.ELEMENT_NODE
            && output_last.nodeType                 === Node.ELEMENT_NODE
            && appendage.tagName.toLowerCase()      === 'span'
            && output_last.tagName.toLowerCase()    === 'span'
            && appendage.children.length            === 0
            && output_last.children.length          === 0
            && is_same_classlist(output_last, appendage)) {
                output_last.appendChild(document.createTextNode(string));
                output_last.normalize();
            }
            else {
                output.appendChild(appendage);
            }
        }

        if (i + 1 < lines.length) {
            output.appendChild(document.createComment("breakpoint"));
        }
    }
}
