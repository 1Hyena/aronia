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
    variables : {
        ACCOUNT_NAME : null,
        CHARACTER_NAME : null,
        CHARACTER_RACE : null,
        CHARACTER_CLASS : null,
        SERVER_ID : null,
        SERVER_TIME : null,
        WORLD_TIME : null,
        EXPERIENCE : null,
        EXPERIENCE_TNL : null,
        EXPERIENCE_TNL_MAX : null,
        HEALTH : null,
        HEALTH_MAX : null,
        ENERGY : null,
        ENERGY_MAX : null,
        LEVEL : null,
        MONEY : null,
        TO_HIT : null,
        TO_DAM : null,
        STR : null,
        STR_BASE : null,
        DEX : null,
        DEX_BASE : null,
        INT : null,
        INT_BASE : null,
        WIS : null,
        WIS_BASE : null,
        CON : null,
        CON_BASE : null,
        AC : null,
        EXITS : null,
        EXITS_N : null,
        EXITS_S : null,
        EXITS_E : null,
        EXITS_W : null,
        EXITS_NE : null,
        EXITS_NW : null,
        EXITS_SE : null,
        EXITS_SW : null,
        SECTOR : null,
        SECTOR_N : null,
        SECTOR_S : null,
        SECTOR_E : null,
        SECTOR_W : null,
        SECTOR_NE : null,
        SECTOR_NW : null,
        SECTOR_SE : null,
        SECTOR_SW : null
    },
    renewing : {},
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

function msdp_deinit() {
    for (const [key, value] of Object.entries(msdp.lists)) {
        msdp.lists[key] = null;
    }

    for (const [key, value] of Object.entries(msdp.variables)) {
        msdp.variables[key] = null;
    }

    msdp.enabled = false;
    msdp.incoming = [];
    msdp.outgoing = [];
}

function msdp_init() {
    for (const [key, value] of Object.entries(msdp.lists)) {
        if (value !== null) {
            continue;
        }

        msdp.outgoing.push(...msdp_serialize_sb( { LIST : key } ));
    }
}

function msdp_flush() {
    if (msdp.outgoing.length > 0) {
        let outgoing = msdp.outgoing;
        msdp.outgoing = [];

        amc_send_bytes(outgoing);
    }
}

function msdp_handler() {
    if (netio.server.msdp === true && msdp.enabled === false) {
        msdp.enabled = true;
        msdp_init();
    }

    do {
        msdp_flush();

        if (msdp.incoming.length > 0) {
            msdp_handle_incoming();
        }
    } while (msdp.outgoing.length > 0 || msdp.incoming.length > 0);
}

function msdp_configure_variable(variable) {
    switch (variable) {
        default: break;
        case "CLIENT_NAME" : {
            msdp.outgoing.push(
                ...msdp_serialize_sb( { [variable] : global.client.name } )
            );
            break;
        }
        case "CLIENT_VERSION" : {
            msdp.outgoing.push(
                ...msdp_serialize_sb( { [variable] : global.client.version } )
            );
            break;
        }
    }

    msdp_flush();
}

function msdp_send_variable(variable) {
    msdp.outgoing.push(
        ...msdp_serialize_sb( { SEND : variable } )
    );

    msdp_flush();

    msdp.renewing[variable] = undefined;
}

function msdp_report_variable(variable) {
    msdp.outgoing.push(
        ...msdp_serialize_sb( { REPORT : variable } )
    );

    msdp_flush();
}

function msdp_unreport_variable(variable) {
    msdp.outgoing.push(
        ...msdp_serialize_sb( { UNREPORT : variable } )
    );

    msdp_flush();
}

function msdp_configure_variables() {
    for (let i=0; i<msdp.lists.CONFIGURABLE_VARIABLES.length; ++i) {
        msdp_configure_variable(msdp.lists.CONFIGURABLE_VARIABLES[i]);
    }
}

function msdp_report_variables() {
    for (let i=0; i<msdp.lists.REPORTABLE_VARIABLES.length; ++i) {
        if (msdp.lists.REPORTABLE_VARIABLES[i] in msdp.variables) {
            msdp_report_variable(msdp.lists.REPORTABLE_VARIABLES[i]);
        }
    }
}

function msdp_handle_list(key) {
    switch (key) {
        default: break;
        case "CONFIGURABLE_VARIABLES": {
            msdp_configure_variables();
            break;
        }
        case "REPORTABLE_VARIABLES": {
            msdp_report_variables();
            break;
        }
    }
}

function msdp_update_variable(key, value) {
    if (key in msdp.variables == false) {
        bug();
        return;
    }

    msdp.variables[key] = value;

    switch (key) {
        default: break;
        case "EXITS":
        case "EXITS_N":
        case "EXITS_S":
        case "EXITS_E":
        case "EXITS_W":
        case "EXITS_NE":
        case "EXITS_NW":
        case "EXITS_SE":
        case "EXITS_SW": {
            amc_view_update_exits(key);
            break;
        }
        case "SECTOR":
        case "SECTOR_N":
        case "SECTOR_S":
        case "SECTOR_E":
        case "SECTOR_W":
        case "SECTOR_NE":
        case "SECTOR_NW":
        case "SECTOR_SE":
        case "SECTOR_SW": {
            amc_view_update_sectors(key);
            break;
        }
        case "ACCOUNT_NAME": {
            break;
        }
        case "CHARACTER_NAME": {
            amc_view_update_character_title();
            break;
        }
        case "CHARACTER_RACE": {
            amc_view_update_character_title();
            break;
        }
        case "CHARACTER_CLASS": {
            amc_view_update_character_title();
            break;
        }
        case "SERVER_ID": {
            break;
        }
        case "SERVER_TIME": {
            break;
        }
        case "WORLD_TIME": {
            break;
        }
        case "EXPERIENCE": {
            amc_view_update_xp();
            break;
        }
        case "EXPERIENCE_TNL": {
            amc_view_update_xp();
            break;
        }
        case "EXPERIENCE_TNL_MAX": {
            amc_view_update_xp();
            break;
        }
        case "HEALTH": {
            amc_text_to_tui_class("amc-statview-health", value, "right");
            amc_view_update_health_bar();
            break;
        }
        case "HEALTH_MAX": {
            amc_text_to_tui_class(
                "amc-statview-health-max", value.padStart(4, " ")
            );
            amc_view_update_health_bar();
            break;
        }
        case "ENERGY": {
            amc_text_to_tui_class("amc-statview-energy", value, "right");
            amc_view_update_energy_bar();
            break;
        }
        case "ENERGY_MAX": {
            amc_text_to_tui_class(
                "amc-statview-energy-max", value.padStart(4, " ")
            );
            amc_view_update_energy_bar();
            break;
        }
        case "LEVEL": {
            amc_view_update_xp();
            break;
        }
        case "MONEY": {
            break;
        }
        case "AC": {
            amc_text_to_tui_class(
                "amc-statview-ac", value.padStart(4, " ")
            );
            break;
        }
        case "TO_HIT": {
            amc_text_to_tui_class(
                "amc-statview-hitroll", value.padStart(4, " ")
            );
            break;
        }
        case "TO_DAM": {
            amc_text_to_tui_class(
                "amc-statview-damroll", value.padStart(4, " ")
            );
            break;
        }
        case "STR": {
            amc_text_to_tui_class(
                "amc-statview-str", value.padStart(4, " ")
            );
            break;
        }
        case "STR_BASE": {
            amc_text_to_tui_class(
                "amc-statview-str-base", value.padStart(3, " ")
            );
            break;
        }
        case "DEX": {
            amc_text_to_tui_class(
                "amc-statview-dex", value.padStart(4, " ")
            );
            break;
        }
        case "DEX_BASE": {
            amc_text_to_tui_class(
                "amc-statview-dex-base", value.padStart(3, " ")
            );
            break;
        }
        case "INT": {
            amc_text_to_tui_class(
                "amc-statview-int", value.padStart(4, " ")
            );
            break;
        }
        case "INT_BASE": {
            amc_text_to_tui_class(
                "amc-statview-int-base", value.padStart(3, " ")
            );
            break;
        }
        case "WIS": {
            amc_text_to_tui_class(
                "amc-statview-wis", value.padStart(4, " ")
            );
            break;
        }
        case "WIS_BASE": {
            amc_text_to_tui_class(
                "amc-statview-wis-base", value.padStart(3, " ")
            );
            break;
        }
        case "CON": {
            amc_text_to_tui_class(
                "amc-statview-con", value.padStart(4, " ")
            );
            break;
        }
        case "CON_BASE": {
            amc_text_to_tui_class(
                "amc-statview-con-base", value.padStart(3, " ")
            );
            break;
        }
    }
}

function msdp_handle_variable(key, value) {
    if (key in msdp.variables == false) {
        bug();
        return;
    }

    if (key in msdp.renewing) {
        delete msdp.renewing[key];
    }
    else if (JSON.stringify(value) === JSON.stringify(msdp.variables[key])) {
        return;
    }

    switch (key) {
        default: break;
        case "SERVER_ID": {
            log("Server identifies as "+value+".");
            break;
        }
        case "SERVER_TIME": {
            log("Server time is "+value+".");
            msdp_unreport_variable(key);

            break;
        }
        case "HEALTH": {
            amc_event_change_health(value);
            break;
        }
        case "ENERGY": {
            amc_event_change_energy(value);
            break;
        }
        case "CHARACTER_NAME": {
            amc_event_change_character(value);
            break;
        }
    }

    msdp_update_variable(key, value);
}

function msdp_handle_incoming() {
    let incoming = msdp.incoming;
    msdp.incoming = [];

    for (let i=0; i<incoming.length; ++i) {
        let data = msdp_deserialize(incoming[i], incoming[i].length - 2, 3);
        let found = false;

        for (const [key, value] of Object.entries(msdp.lists)) {
            if (key in data == false) {
                continue;
            }

            let handle = msdp.lists[key] === null;
            msdp.lists[key] = data[key];

            if (handle) {
                msdp_handle_list(key);
            }

            found = true;

            break;
        }

        if (found) {
            continue;
        }

        for (const [key, value] of Object.entries(msdp.variables)) {
            if (key in data == false) {
                continue;
            }

            msdp_handle_variable(key, data[key]);

            break;
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
                    if (variable !== null) {
                        dictionary[variable] = "";
                        variable = null;
                    }

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
