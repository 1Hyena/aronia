"use strict";

function amc_event_change_health(value) {
    if (msdp.variables.HEALTH === null
    ||  msdp.variables.HEALTH_MAX === null) {
        return;
    }

    if (parseInt(value) >= parseInt(msdp.variables.HEALTH_MAX)
    &&  parseInt(msdp.variables.HEALTH) < parseInt(msdp.variables.HEALTH_MAX)) {
        play_sound("sfx-health", 0.5);
    }
}

function amc_event_change_spirit(value) {
    if (msdp.variables.SPIRIT === null
    ||  msdp.variables.SPIRIT_MAX === null) {
        return;
    }

    if (parseInt(value) >= parseInt(msdp.variables.SPIRIT_MAX)
    &&  parseInt(msdp.variables.SPIRIT) < parseInt(msdp.variables.SPIRIT_MAX)) {
        play_sound("sfx-spirit", 0.5);
    }
}

function amc_event_change_character(value) {
    if (value.length === 0) {
        return;
    }

    let ingame_variables = [
        "EXITS",        "EXITS_N",          "EXITS_S",          "EXITS_E",
        "EXITS_W",      "EXITS_NE",         "EXITS_NW",         "EXITS_SE",
        "EXITS_SW",     "SECTOR",           "SECTOR_N",         "SECTOR_S",
        "SECTOR_E",     "SECTOR_W",         "SECTOR_NE",        "SECTOR_NW",
        "SECTOR_SE",    "SECTOR_SW",        "ROOM_NAME",        "ROOM_DESC",
        "EXIT_INFO",    "ROOM_ITEM_LIST",   "ROOM_CHAR_LIST",   "MAP",
        "ROOM_VNUM",    "AREA_NAME"
    ];

    amc_show_mudstate("in-game");

    for (let i=0; i<ingame_variables.length; ++i) {
        msdp_send_variable(ingame_variables[i]);
    }
}
