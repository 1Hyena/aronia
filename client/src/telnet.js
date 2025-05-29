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

        info_iac_esc_txt_log.push(...terminal_deserialize(packet.data));

        if (packet.data.length > 0) {
            info_iac_esc_txt_log.push(packet);
            info_iac_esc_txt_log.push(...info_iac_log);

            break;
        }
    }

    return info_iac_esc_txt_log;
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
