"use strict";

var telnet = {
    IAC         : 255,
    DO          : 253,
    DONT        : 254,
    WILL        : 251,
    WONT        : 252,
    SE          : 240,
    SB          : 250,
    EOR         : 239,
    TELOPT_EOR  : 25,
    MSDP        : 69,
    server : {
        eor     : false,
        msdp    : false
    }
};

function telnet_deinit() {
    telnet.server.eor = false;
    telnet.server.msdp = false;
}

function telnet_make_packet(type, array, start, size) {
    return {
        type : type,
        data : array.slice(start, start + size)
    };
}

function telnet_deserialize(byte_array) {
    let info_iac_log = [];

    do {
        if (!byte_array.length) {
            break;
        }

        var nonblocking_length = telnet_get_iac_nonblocking_length(byte_array);
        var blocked_length = byte_array.length - nonblocking_length;

        if (nonblocking_length > 0) {
            info_iac_log.push(
                telnet_make_packet("log", byte_array, 0, nonblocking_length)
            );
        }

        var total_iac_length = 0;

        do {
            var iac_length = telnet_get_iac_sequence_length(
                byte_array, nonblocking_length + total_iac_length,
                blocked_length - total_iac_length
            );

            if (!iac_length) {
                break;
            }

            info_iac_log.push(
                telnet_make_packet(
                    "iac", byte_array,
                    nonblocking_length + total_iac_length, iac_length
                )
            );

            total_iac_length += iac_length;
        } while (true);

        byte_array.splice(0, nonblocking_length + total_iac_length);

        if (!total_iac_length) {
            break;
        }
    } while (true);

    let info_iac_esc_txt_log = [];

    while (info_iac_log.length > 0) {
        let packet = info_iac_log.shift();

        if (packet.type !== "log") {
            info_iac_esc_txt_log.push(packet);
            continue;
        }

        let data = packet.data;

        do {
            if (!data.length) {
                break;
            }

            var nonblocking_length = telnet_get_esc_nonblocking_length(data);
            var blocked_length = data.length - nonblocking_length;

            if (nonblocking_length > 0) {
                info_iac_esc_txt_log.push(
                    telnet_make_packet("txt", data, 0, nonblocking_length)
                );
            }

            var total_esc_length = 0;

            do {
                var esc_length = telnet_get_esc_sequence_length(
                    data, nonblocking_length + total_esc_length,
                    blocked_length - total_esc_length
                );

                if (!esc_length) {
                    break;
                }

                info_iac_esc_txt_log.push(
                    telnet_make_packet(
                        "esc", data,
                        nonblocking_length + total_esc_length, esc_length
                    )
                );

                total_esc_length += esc_length;
            } while (true);

            data.splice(0, nonblocking_length + total_esc_length);

            if (!total_esc_length) {
                break;
            }
        } while (true);

        if (data.length > 0) {
            info_iac_esc_txt_log.push(packet);
            info_iac_esc_txt_log.push(...info_iac_log);

            break;
        }
    }

    return info_iac_esc_txt_log;
}

function telnet_get_esc_nonblocking_length(txt) {
    for (let i = 0, length = txt.length; i < length; ++i) {
        if (txt[i] != 27) {
            continue;
        }

        return i;
    }

    return txt.length;
}

function telnet_get_esc_sequence_length(data, start, size) {
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
            case 93: { // ]
                if (i+3 < start + size
                &&  data[i+1] === "0".charCodeAt(0)
                &&  data[i+2] === ";".charCodeAt(0)) {
                    for (let j=i+3; j < start + size ; ++j) {
                        let seqlen = j - start + 1;
                        let c = data[j];

                        if (c === 7) {
                            return seqlen;
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

function telnet_get_iac_sequence_length(data, start, size) {
    var iac_active = false;
    var i = start;

    for (; i < start + size; ++i) {
        if (!iac_active) {
            if (data[i] == telnet.IAC) {
                iac_active = true;

                continue;
            }

            return 0;
        }

        switch (data[i]) {
            case telnet.DO:
            case telnet.DONT:
            case telnet.WILL:
            case telnet.WONT: {
                return size < 3 ? 0 : 3;
            }
            case telnet.SB: {
                // subnegotiation

                for (var j = i + 2; ; j++) {
                    if (j + 1 >= start + size) {
                        break;
                    }

                    if (data[j] != telnet.IAC) {
                        continue;
                    }

                    switch (data[j+1]) {
                        case telnet.SE: {
                            return (j + 2) - start;
                        }
                        case telnet.IAC: {
                            ++j;
                            continue;
                        }
                        default: {
                            // Anything other than SE or IAC after IAC actually
                            // violates the telnet option subnegotiation protcol
                            // because the meaning of it has not been defined.

                            continue;
                        }
                    }
                }

                return 0;
            }
            case telnet.IAC:
            default: {
                // 2-byte commands such as IAC GA
                return 2;
            }
        }
    }

    return 0;
}

function telnet_get_iac_nonblocking_length(txt) {
    for (var i = 0, length = txt.length; i < length; ++i) {
        if (txt[i] != telnet.IAC) {
            continue;
        }

        return i;
    }

    return length;
}

function telnet_deserialize_esc(data) {
    let state_reset = {
        hidden : null,
        bold : null,
        faint: null,
        underline: null,
        blinking: null,
        reverse: null,
        italic: null,
        strikethrough: null,
        fg : null
    };

    let state = {};

    if (data.length > 3) {
        if (data.length >= 5) {
            if (data[0] === 27
            &&  data[1] === 93
            &&  data[2] === "0".charCodeAt(0)
            &&  data[3] === ";".charCodeAt(0)
            &&  data[data.length  - 1] === 7) {
                state.title = String.fromCharCode(
                    ...data.slice(4, data.length - 1)
                );

                return state;
            }
        }

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
                        for (const [key, value] of Object.entries(state_reset)) {
                            state[key] = value;
                        }

                        break;
                    }
                    case 1: {
                        state.bold = true;
                        break;
                    }
                    case 2: {
                        state.faint = true;
                        break;
                    }
                    case 3: {
                        state.italic = true;
                        break;
                    }
                    case 4: {
                        state.underline = true;
                        break;
                    }
                    case 5: {
                        state.blinking = true;
                        break;
                    }
                    case 7: {
                        state.reverse = true;
                        break;
                    }
                    case 8: {
                        state.hidden = true;
                        break;
                    }
                    case 9: {
                        state.strikethrough = true;
                        break;
                    }
                    case 22: {
                        state.bold = null;
                        state.faint = null;
                    }
                    case 23: {
                        state.italic = null;
                    }
                    case 24: {
                        state.underline = null;
                    }
                    case 25: {
                        state.blinking = null;
                    }
                    case 27: {
                        state.reverse = null;
                    }
                    case 28: {
                        state.hidden = null;
                        break;
                    }
                    case 29: {
                        state.strikethrough = null;
                        break;
                    }
                    case 30: {
                        state.fg = "black";
                        break;
                    }
                    case 31: {
                        state.fg = "red";
                        break;
                    }
                    case 32: {
                        state.fg = "green";
                        break;
                    }
                    case 33: {
                        state.fg = "yellow";
                        break;
                    }
                    case 34: {
                        state.fg = "blue";
                        break;
                    }
                    case 35: {
                        state.fg = "magenta";
                        break;
                    }
                    case 36: {
                        state.fg = "cyan";
                        break;
                    }
                    case 37: {
                        state.fg = "white";
                        break;
                    }
                    case 39: {
                        state.fg = "default";
                        break;
                    }
                    default: break;
                }
            }

            return state;
        }
    }

    return state;
}
