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
    TELOPT_EOR  : 25
};

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
                if (i + 1 >= start + size) {
                    return 0;
                }

                return (i + 2) - start;
            }
            case netio.SB: {
                // subnegotiation

                for (var j = i + 1; j + 2 < start + size; j++) {
                    if (data[j] != netio.IAC
                    &&  data[j + 1] == netio.IAC
                    &&  data[j + 2] == netio.SE) {
                        return (j + 3) - start;
                    }
                }

                return 0;
            }
            case netio.IAC:
            default: {
                // 2-byte commands such as IAC GA
                return (i + 1) - start;
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
            return true;
        }

        var nonblocking_length = get_iac_nonblocking_length(incoming.data);
        var blocked_length = incoming.data.length - nonblocking_length;

        incoming.info.push(
            make_info_packet("log", incoming.data, 0, nonblocking_length)
        );

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
