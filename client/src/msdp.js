"use strict";

var msdp = {
    VAR         : 1,
    VAL         : 2,
    TABLE_OPEN  : 3,
    TABLE_CLOSE : 4,
    ARRAY_OPEN  : 5,
    ARRAY_CLOSE : 6,
    enabled : false,
    lists : {
        COMMANDS : null,
        LISTS : null,
        CONFIGURABLE_VARIABLES : null,
        REPORTABLE_VARIABLES : null,
        REPORTED_VARIABLES : null,
        SENDABLE_VARIABLES : null
    },
    incoming : [],
    outgoing : []
};

function msdp_serialize_sb(obj) {
    return [
        netio.IAC, netio.SB, netio.MSDP,
        ...msdp_serialize(obj),
        netio.IAC, netio.SE
    ];
}

function msdp_init() {
    for (const [key, value] of Object.entries(msdp.lists)) {
        if (value !== null) {
            continue;
        }

        msdp.outgoing.push(...msdp_serialize_sb( { LIST : key } ));
    }
}

function msdp_handler() {
    if (netio.server.msdp === true && msdp.enabled === false) {
        msdp.enabled = true;
        msdp_init();
    }

    do {
        if (msdp.outgoing.length > 0) {
            let outgoing = msdp.outgoing;
            msdp.outgoing = [];

            global.ws.send(new Uint8Array(outgoing).buffer);
        }

        if (msdp.incoming.length > 0) {
            msdp_handle_incoming();
        }
    } while (msdp.outgoing.length > 0 || msdp.incoming.length > 0);
}

function msdp_handle_incoming() {
    let incoming = msdp.incoming;
    msdp.incoming = [];

    for (let i=0; i<incoming.length; ++i) {
        let data = msdp_deserialize(incoming[i], incoming[i].length - 2, 3);

        for (const [key, value] of Object.entries(msdp.lists)) {
            if (key in data == false) {
                continue;
            }

            msdp.lists[key] = data[key];
        }
    }
}

function msdp_deserialize_data(bin, length, start) {
    let dec = new TextDecoder();
    let buffer = [];

    for (let i=start; i<length; ++i) {
        switch (bin[i]) {
            case msdp.VAR:
            case msdp.VAL:
            case msdp.TABLE_OPEN:
            case msdp.TABLE_CLOSE:
            case msdp.ARRAY_OPEN:
            case msdp.ARRAY_CLOSE: {
                i = length;
                continue;
            }
            default: {
                break;
            }
        }

        buffer.push(bin[i]);
    }

    var obj = {
        value: dec.decode(new Uint8Array(buffer)),
        size: buffer.length
    };

    return obj;
}

function msdp_deserialize_array(bin, length, start) {
    let depth = 0;

    for (let i=start; i<length; ++i) {
        switch (bin[i]) {
            case msdp.ARRAY_OPEN: {
                ++depth;
                break;
            }
            case msdp.ARRAY_CLOSE: {
                if (--depth === 0) {
                    let obj = msdp_deserialize(bin, i, start + 1);

                    if (obj !== null) {
                        obj = {
                            value : obj,
                            size : i - start + 1
                        };
                    }

                    return obj;
                }

                break;
            }
            default: break;
        }
    }

    return null;
}

function msdp_deserialize_table(bin, length, start) {
    let depth = 0;

    for (let i=start; i<length; ++i) {
        switch (bin[i]) {
            case msdp.TABLE_OPEN: {
                ++depth;
                break;
            }
            case msdp.TABLE_CLOSE: {
                if (--depth === 0) {
                    let obj = msdp_deserialize(bin, i, start + 1);

                    if (obj !== null) {
                        obj = {
                            value : obj,
                            size : i - start + 1
                        };
                    }

                    return obj;
                }

                break;
            }
            default: break;
        }
    }

    return null;
}

function msdp_deserialize(bin, length, start) {
    let array = null;
    let dictionary = {};
    let variable = null;

    for (let i=start; i<length; ++i) {
        let obj = null;

        switch (bin[i]) {
            case msdp.VAL: {
                if (i + 1 >= length) {
                    continue;
                }

                ++i;

                switch (bin[i]) {
                    case msdp.TABLE_OPEN: {
                        obj = msdp_deserialize_table(bin, length, i);
                        break;
                    }
                    case msdp.ARRAY_OPEN: {
                        obj = msdp_deserialize_array(bin, length, i);
                        break;
                    }
                    default: {
                        obj = msdp_deserialize_data(bin, length, i);
                        break;
                    }
                }

                if (obj !== null) {
                    if (variable !== null) {
                        dictionary[variable] = obj.value;
                        variable = null;
                    }
                    else {
                        if (array === null) {
                            array = [];
                        }

                        array.push(obj.value);
                    }
                }

                break;
            }
            case msdp.VAR: {
                ++i;
                obj = msdp_deserialize_data(bin, length, i);
                variable = obj.value;

                break;
            }
        }

        if (obj === null) {
            return null;
        }

        i += obj.size - 1;
    }

    return array === null ? dictionary : array;
}

function msdp_serialize(data) {
    let bin = [];
    let enc = new TextEncoder();

    for (const [key, value] of Object.entries(data)) {
        if (typeof value !== 'string' && value instanceof String == false) {
            continue;
        }

        let var_bytes = enc.encode(key);
        let val_bytes = enc.encode(value);

        if (!msdp_test_payload(var_bytes)
        ||  !msdp_test_payload(val_bytes)) {
            continue;
        }

        bin.push(msdp.VAR);
        bin.push(...Array.from(var_bytes));
        bin.push(msdp.VAL);
        bin.push(...Array.from(val_bytes));
    }

    return bin;
}

function msdp_test_payload(uint8array) {
    for (let i=0; i<uint8array.length; ++i) {
        switch (uint8array[i]) {
            case msdp.VAR         : return false;
            case msdp.VAL         : return false;
            case msdp.TABLE_OPEN  : return false;
            case msdp.TABLE_CLOSE : return false;
            case msdp.ARRAY_OPEN  : return false;
            case msdp.ARRAY_CLOSE : return false;
            default: break;
        }
    }

    return true;
}
