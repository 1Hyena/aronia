"use strict";

var netio = {
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

function netio_deinit() {
    netio.server.eor = false;
    netio.server.msdp = false;
}

function get_iac_sequence_length(data, start, size) {
    var iac_active = false;
    var i = start;

    for (; i < start + size; ++i) {
        if (!iac_active) {
            if (data[i] == netio.IAC) {
                iac_active = true;

                continue;
            }

            return 0;
        }

        switch (data[i]) {
            case netio.DO:
            case netio.DONT:
            case netio.WILL:
            case netio.WONT: {
                return size < 3 ? 0 : 3;
            }
            case netio.SB: {
                // subnegotiation

                for (var j = i + 2; ; j++) {
                    if (j + 1 >= start + size) {
                        break;
                    }

                    if (data[j] != netio.IAC) {
                        continue;
                    }

                    switch (data[j+1]) {
                        case netio.SE: {
                            return (j + 2) - start;
                        }
                        case netio.IAC: {
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
            case netio.IAC:
            default: {
                // 2-byte commands such as IAC GA
                return 2;
            }
        }
    }

    return 0;
}

function get_iac_nonblocking_length(txt) {
    for (var i = 0, length = txt.length; i < length; ++i) {
        if (txt[i] != netio.IAC) {
            continue;
        }

        return i;
    }

    return length;
}

function make_info_packet(type, array, start, size) {
    return {
        type : type,
        data : array.slice(start, start + size)
    };
}

function receive_from_incoming(incoming) {
    do {
        if (!incoming.data.length) {
            break;
        }

        var nonblocking_length = get_iac_nonblocking_length(incoming.data);
        var blocked_length = incoming.data.length - nonblocking_length;

        if (nonblocking_length > 0) {
            incoming.info.push(
                make_info_packet("log", incoming.data, 0, nonblocking_length)
            );
        }

        var total_iac_length = 0;

        do {
            var iac_length = get_iac_sequence_length(
                incoming.data, nonblocking_length + total_iac_length,
                blocked_length - total_iac_length
            );

            if (!iac_length) {
                break;
            }

            incoming.info.push(
                make_info_packet(
                    "iac", incoming.data,
                    nonblocking_length + total_iac_length, iac_length
                )
            );

            total_iac_length += iac_length;
        } while (true);

        incoming.data = incoming.data.slice(
            nonblocking_length + total_iac_length
        );

        if (!total_iac_length) {
            break;
        }
    } while (true);

    return true;
}

function amc_send_bytes(array) {
    global.ws.send(new Uint8Array(array).buffer);
}

function amc_send_command(line) {
    let encoder = new TextEncoder();

    global.ws.send(encoder.encode(line+"\n").buffer);
}
