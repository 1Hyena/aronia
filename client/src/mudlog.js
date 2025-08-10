"use strict";

function amc_handle_log(data) {
    if (data.length === 0) {
        return;
    }

    global.mud.log.data.push(...data);

    data = global.mud.log.data;
    global.mud.log.data = [];

    let info = telnet_deserialize(data);

    let remaining = [];

    while (info.length > 0) {
        let packet = info.shift();

        if (packet.type !== "log" && remaining.length === 0) {
            global.mud.incoming.info.push(packet);
            continue;
        }

        remaining.push(...packet.data);
    }

    remaining.push(...data);
    remaining.push(...global.mud.log.data);
    global.mud.log.data = remaining;
}

function amc_handle_iac(data) {
    if (data.length === 2) {
        if (data[0] !== telnet.IAC) {
            bug();
            return;
        }

        if (data[1] === telnet.EOR) {
            amc_flush_printer();
        }
    }
    else if (data.length === 3) {
        if (data[0] !== telnet.IAC) {
            bug();
            return;
        }

        if (data[1] === telnet.WILL && data[2] === telnet.TELOPT_EOR) {
            amc_send_bytes([ telnet.IAC, telnet.DO, telnet.TELOPT_EOR ]);

            telnet.server.eor = true;
        }
        else if (data[1] === telnet.WILL && data[2] === telnet.MSDP) {
            amc_send_bytes([ telnet.IAC, telnet.DO, telnet.MSDP ]);

            telnet.server.msdp = true;
            msdp_handler();
        }
        else if (data[1] === telnet.WILL) {
            amc_send_bytes([ telnet.IAC, telnet.DONT, data[2] ]);
        }
    }
    else if (data.length > 5) {
        if (data[0] !== telnet.IAC) {
            bug();
            return;
        }

        if (data[1] === telnet.SB
        &&  data[2] === telnet.MSDP
        &&  data[data.length-2] === telnet.IAC
        &&  data[data.length-1] === telnet.SE) {
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

        global.mud.log.ansi.sigreset = undefined;
    }
}

function amc_handle_esc(data) {
    let state = terminal_deserialize_esc(data);

    if ("title" in state) {
        global.title = state.title;
        delete state.title;
    }

    for (const [key, value] of Object.entries(state)) {
        if (key in global.mud.log.ansi) {
            global.mud.log.ansi[key] = value;
        }
    }
}

function amc_read_incoming() {
    global.mud.incoming.info.push(
        ...telnet_deserialize(global.mud.incoming.data)
    );

    do {
        let incoming_info = global.mud.incoming.info;
        global.mud.incoming.info = [];

        for (let i=0, sz = incoming_info.length; i<sz; ++i) {
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

function amc_load_history() {
    let output = (
        global.offscreen.terminal || document.getElementById("amc-terminal")
    );

    if (output === global.offscreen.terminal || !amc_scrolled_top()) {
        return;
    }

    if (global.mud.log.hidden.length === 0) {
        return;
    }

    let container = output.parentElement;
    let scroll_top_before = container.scrollTop;
    let scroll_height_before = container.scrollHeight;

    output.prepend(global.mud.log.hidden.pop());

    var scroll_height_after = container.scrollHeight;
    var scroll_height_change = scroll_height_after - scroll_height_before;

    if (scroll_height_change > 0) {
        container.scrollTop = Math.max(
            scroll_top_before + scroll_height_change, 0
        );
    }
}

function amc_optimize_terminal() {
    let lines_per_div = 50;

    let output = (
        global.offscreen.terminal || document.getElementById("amc-terminal")
    );

    if (output === global.offscreen.terminal || !amc_scrolled_bottom()) {
        return;
    }

    let children = output.childNodes;
    let first_visible = null;
    let keep_nodes = [];
    let wrap_nodes = [];
    let wrap_lines = 0;
    let tail_chain = [];
    let visible = false;

    for (let i = 0; i < children.length; i++) {
        let child = children[i];

        if (child.nodeType === Node.ELEMENT_NODE && !visible) {
            if (is_visible(output.parentNode, child, true)) {
                visible = true;
            }
        }

        if (!visible) {
            if (child.nodeType === Node.ELEMENT_NODE
            && child.tagName.toLowerCase() == 'div') {
                keep_nodes.push(child);
                continue;
            }
            else if (child.nodeType === Node.COMMENT_NODE) {
                if (child.nodeValue === "breakpoint") {
                    if (++wrap_lines >= lines_per_div) {
                        let div = document.createElement("div");
                        div.replaceChildren(...wrap_nodes);
                        keep_nodes.push(div);
                        tail_chain = [];
                        wrap_nodes = [];
                        wrap_lines = 0;
                    }
                }
            }
            else {
                wrap_nodes.push(child.cloneNode(true));
            }
        }

        tail_chain.push(child);
    }

    global.mud.log.hidden.push(...keep_nodes);

    keep_nodes = [];

    if (global.mud.log.hidden.length > 0) {
        keep_nodes.push(global.mud.log.hidden.pop());
    }

    keep_nodes.push(...tail_chain);
    output.replaceChildren(...keep_nodes);
}

function amc_update_terminal() {
    if (global.mud.log.buffer === null
    || !amc_scrolled_bottom()) {
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
        && !el_next.classList.contains("ans-sigreset")
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
        && !el_next.classList.contains("ans-sigreset")
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

        if (el.classList.contains("ans-sigreset")) {
            el.classList.remove("ans-sigreset");
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

function amc_match_game_line(line) {
    var expressions = [];

    expressions.push("(^)( Account Menu:)($)");

    if (expressions.length === 0) {
        return;
    }

    for (let i=0; i<expressions.length; ++i) {
        let regex = new RegExp(expressions[i]);
        let match = regex.exec(line) || [];

        if (match.length !== 4) {
            continue;
        }

        if (i === 0) {
            amc_set_mud_state("account-menu");
        }
    }
}

function amc_match_login_line(line) {
    var expressions = [];

    switch (amc_get_mud_state()) {
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

        switch (amc_get_mud_state()) {
            case "": {
                amc_set_mud_state("login");
                break;
            }
            case "login": {
                amc_set_mud_state("login-manual");
                break;
            }
            case "login-sending-username": {
                amc_set_mud_state("login-sending-password");
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
                    amc_set_mud_state("login-wrong-password");
                    break;
                }

                amc_set_mud_state("account-menu");
                break;
            }
            case "login-manual": {
                amc_set_mud_state("account-menu");
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

function amc_match_line(line) {
    switch (amc_get_mud_state()) {
        case "":
        case "login":
        case "login-sending-username":
        case "login-manual":
        case "login-wrong-password":
        case "login-sending-password": {
            amc_match_login_line(line);
            break;
        }
        case "in-game": {
            amc_match_game_line(line);
            break;
        }
        default: break;
    }

    amc_match_chat_line(line);

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

function amc_scrolled_bottom() {
    let output = (
        global.offscreen.terminal || document.getElementById("amc-terminal")
    );

    return (
        output.parentNode ? is_scrolled_bottom(output.parentNode) : false
    );
}

function amc_scrolled_top() {
    let output = (
        global.offscreen.terminal || document.getElementById("amc-terminal")
    );

    return (
        output.parentNode ? is_scrolled_top(output.parentNode) : false
    );
}

function amc_print(string, ansi) {
    amc_print_to_buffer(string, ansi);

    if (amc_scrolled_bottom()) {
        amc_update_terminal();
    }
}

function amc_print_to_buffer(string, ansi) {
    if (string.length === 0) {
        return;
    }

    if (global.mud.log.buffer === null) {
        global.mud.log.buffer = new DocumentFragment();
    }

    terminal_text_to_node(string, global.mud.log.buffer, ansi);
}
