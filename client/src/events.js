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
