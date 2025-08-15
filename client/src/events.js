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

function amc_event_change_energy(value) {
    if (msdp.variables.ENERGY === null
    ||  msdp.variables.ENERGY_MAX === null) {
        return;
    }

    if (parseInt(value) >= parseInt(msdp.variables.ENERGY_MAX)
    &&  parseInt(msdp.variables.ENERGY) < parseInt(msdp.variables.ENERGY_MAX)) {
        play_sound("sfx-energy", 0.5);
    }
}

function amc_event_change_character(value) {
    if (value.length === 0) {
        return;
    }

    let mainview_variables = [
        "EXITS",        "EXITS_N",          "EXITS_S",          "EXITS_E",
        "EXITS_W",      "EXITS_NE",         "EXITS_NW",         "EXITS_SE",
        "EXITS_SW",     "SECTOR",           "SECTOR_N",         "SECTOR_S",
        "SECTOR_E",     "SECTOR_W",         "SECTOR_NE",        "SECTOR_NW",
        "SECTOR_SE",    "SECTOR_SW",        "ROOM_NAME",        "ROOM_DESC",
        "EXIT_INFO",    "ROOM_ITEM_LIST",   "ROOM_CHAR_LIST",   "MAP",
        "ROOM_VNUM"
    ];

    amc_show_mudstate("in-game");

    for (let i=0; i<mainview_variables.length; ++i) {
        msdp_send_variable(mainview_variables[i]);
    }
}
