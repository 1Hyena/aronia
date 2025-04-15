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
            case 91: { // [
                for (let j=i+1; j < start + size ; ++j) {
                    if (data[j] === 109) { // m
                        return j - start + 1;
                    }
                }

                break;
            }
            default: break;
        }

        return 1;
    }

    return 0;
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

        global.mud.incoming.info.push(
            make_info_packet("txt", data, 0, nonblocking_length)
        );

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
                    case 3: {
                        global.mud.log.ansi.italic = true;
                        break;
                    }
                    case 22: {
                        global.mud.log.ansi.bold = null;
                    }
                    case 23: {
                        global.mud.log.ansi.italic = null;
                    }
                    case 8: { // set hidden
                        global.mud.log.ansi.hidden = true;
                        break;
                    }
                    case 28: { // reset hidden
                        global.mud.log.ansi.hidden = null;
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
                    }
                }, 500
            );
        }
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

        amc_print(str, global.mud.log.text.utf8.packets[i].ansi);
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

        amc_print(print.join(""), packets[i].ansi);
    }

    if (packets[split_packet].data.length === 0) {
        packets.splice(0, split_packet + 1);
    }
    else {
        packets.splice(0, split_packet);
    }
}

function amc_print(string, ansi) {
    ansi = typeof ansi !== 'undefined' ? ansi : {};

    let output = (
        global.offscreen.terminal || document.getElementById("amc-terminal")
    );

    let bottom = (
        output.parentNode ? is_scrolled_bottom(output.parentNode) : false
    );

    let plain = true;

    for (const [key, value] of Object.entries(ansi)) {
        if (ansi[key] !== null) {
            plain = false;
            break;
        }
    }

    if (plain) {
        if (output.lastChild && output.lastChild.nodeType === Node.TEXT_NODE) {
            output.lastChild.textContent += string;
        }
        else {
            output.appendChild(document.createTextNode(string));
        }
    }
    else {
        let span = document.createElement("span");
        span.appendChild(document.createTextNode(string));

        if (ansi.hidden === true) {
            span.classList.add("ansi-hidden");
        }

        if (ansi.bold === true) {
            span.classList.add("ansi-bold");
        }

        if (ansi.italic === true) {
            span.classList.add("ansi-italic");
        }

        if (ansi.fg !== null) {
            span.classList.add("ansi-fg-"+ansi.fg);
        }

        output.appendChild(span);
    }

    if (bottom) {
        scroll_to_bottom("amc-terminal-wrapper");
    }
}
