"use strict";

function amc_iac(data) {
    if (data.length === 2) {
        if (data[0] !== netio.IAC) {
            bug();
            return;
        }

        if (data[1] === netio.EOR) {
            amc_flush_log();
        }
    }
    else if (data.length === 3) {
        if (data[0] !== netio.IAC) {
            bug();
            return;
        }

        if (data[1] === netio.WILL && data[2] === netio.TELOPT_EOR) {
            global.ws.send(
                new Uint8Array(
                    [ netio.IAC, netio.DO, netio.TELOPT_EOR ]
                ).buffer
            );

            netio.server.eor = true;
        }
        else if (data[1] === netio.WILL && data[2] === netio.MSDP) {
            global.ws.send(
                new Uint8Array(
                    [ netio.IAC, netio.DO, netio.MSDP ]
                ).buffer
            );

            netio.server.msdp = true;
            msdp_handler();
        }
        else if (data[1] === netio.WILL) {
            global.ws.send(
                new Uint8Array(
                    [ netio.IAC, netio.DONT, data[2] ]
                ).buffer
            );
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

function amc_read_incoming() {
    receive_from_incoming(global.mud.incoming);

    let incoming_info = global.mud.incoming.info;
    global.mud.incoming.info = [];

    for (var i=0, sz = incoming_info.length; i<sz; ++i) {
        switch (incoming_info[i].type) {
            case "log": {
                global.mud.log.data.push(...incoming_info[i].data);
                global.mud.log.time = Date.now();

                break;
            }
            case "iac": {
                amc_iac(incoming_info[i].data);

                break;
            }
            default: continue;
        }
    }

    if (global.mud.log.data.length > 0) {
        amc_write_log();

        if (global.mud.log.data.length > 0) {
            setTimeout(
                function() {
                    if (global.mud.log.data.length > 0
                    && (Date.now() - global.mud.log.time) > 250) {
                        amc_flush_log();
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
                global.ws.send(str2buf(global.mud.account.password+"\n"));
                break;
            }
            case "login-wrong-password":
            case "login-sending-password": {
                if (i === 1) {
                    global.ws.send(str2buf("yes\n"));
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
    line = strip_ansiesc(line);

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

function amc_match_ctrl_line(line) {
    var regex = new RegExp(
        "(^.*\\x1B\\[8m\\x1B\\]0;)(.+)(\\x07\\x1B\\[28m\\x1B\\[0m.*$)"
    );

    var match = regex.exec(line) || [];

    if (match.length !== 4) {
        return;
    }

    global.title = match[2];
}

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
    amc_match_ctrl_line(line);

    return;
}

function amc_write_line(data, start, length) {
    var buffer = [];

    for (var i=0; i<length; ++i) {
        buffer.push(data[start+i]);
    }

    if (buffer.length === 0) {
        return;
    }

    global.xt.terminal.write(new Uint8Array(buffer));

    for (;;) {
        var char = buffer.pop();

        if (char !== 10 && char !== 13) {
            buffer.push(char);
            break;
        }

        if (buffer.length === 0) {
            return;
        }
    }

    var line = String.fromCharCode(...buffer);

    amc_match_line(line);
}

function amc_flush_log() {
    amc_write_log();

    if (global.mud.log.data.length <= 0) {
        return;
    }

    global.xt.terminal.write(global.mud.log.data);
    amc_match_line(String.fromCharCode(...global.mud.log.data));
    global.mud.log.data = [];
}

function amc_write_log() {
    var written = 0;

    for (var i=0, sz = global.mud.log.data.length; i<sz; ++i) {
        if (global.mud.log.data[i] === 10) {
            var length = (i + 1) - written;

            if (i + 1 < sz && global.mud.log.data[i + 1] === 13) {
                length++;
                i++;
            }

            amc_write_line(global.mud.log.data, written, length);

            written += length;
        }
    }

    if (written > 0) {
        global.mud.log.data = global.mud.log.data.slice(written);
    }
}
