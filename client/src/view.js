"use strict";

function amc_init_mainview(container) {
    if (container === null) {
        return;
    }

    if (document.getElementById("amc-mainview-wrapper") !== null) {
        return;
    }

    var wrapper = document.createElement("div");

    wrapper.id = "amc-mainview-wrapper";

    var placeholder = document.createElement("pre");

    placeholder.appendChild(
        document.createTextNode(amc_get_roguelike_placeholder())
    );

    wrapper.appendChild(placeholder);

    container.replaceChildren(wrapper);
}

function amc_init_zoneview(container) {
    if (container === null) {
        return;
    }

    if (document.getElementById("amc-zoneview-wrapper") !== null) {
        bug();
        return;
    }

    var wrapper = document.createElement("div");

    wrapper.id = "amc-zoneview-wrapper";

    var placeholder = document.createElement("pre");

    placeholder.appendChild(
        document.createTextNode(amc_get_secondary_top_placeholder())
    );

    wrapper.appendChild(placeholder);

    container.appendChild(wrapper);
}

function amc_init_eqview(container) {
    if (container === null) {
        return;
    }

    if (document.getElementById("amc-eqview-wrapper") !== null) {
        bug();
        return;
    }

    var wrapper = document.createElement("div");

    wrapper.id = "amc-eqview-wrapper";

    var placeholder = document.createElement("pre");

    placeholder.appendChild(
        document.createTextNode(amc_get_equipment_placeholder())
    );

    wrapper.appendChild(placeholder);

    container.appendChild(wrapper);
}

function amc_init_inventory_view(container) {
    if (container === null) {
        return;
    }

    if (document.getElementById("amc-inventory-view-wrapper") !== null) {
        bug();
        return;
    }

    var wrapper = document.createElement("div");

    wrapper.id = "amc-inventory-view-wrapper";

    var placeholder = document.createElement("pre");

    placeholder.appendChild(
        document.createTextNode(amc_get_inventory_placeholder())
    );

    wrapper.appendChild(placeholder);

    container.appendChild(wrapper);
}

function amc_init_roomview(container) {
    if (container === null) {
        return;
    }

    if (document.getElementById("amc-roomview-wrapper") !== null) {
        bug();
        return;
    }

    var wrapper = document.createElement("div");

    wrapper.id = "amc-roomview-wrapper";

    var placeholder = document.createElement("pre");

    placeholder.appendChild(
        document.createTextNode(amc_get_roomview_placeholder())
    );

    wrapper.appendChild(placeholder);

    container.appendChild(wrapper);
}

function amc_init_statview(container) {
    if (container === null) {
        return;
    }

    if (document.getElementById("amc-statview-wrapper") !== null) {
        bug();
        return;
    }

    var wrapper = document.createElement("div");

    wrapper.id = "amc-statview-wrapper";

    wrapper.appendChild(amc_create_statview());

    container.appendChild(wrapper);

    amc_text_to_tui_class("amc-statview-label-health", "Health:");
    amc_text_to_tui_class("amc-statview-label-energy", "Energy:");
    amc_text_to_tui_class("amc-statview-label-ac", "Armor Class:");
    amc_text_to_tui_class("amc-statview-label-hitroll", "To Hit:");
    amc_text_to_tui_class("amc-statview-label-damroll", "To Damage:");
    amc_text_to_tui_class("amc-statview-label-affected", "Affected By:");
    amc_text_to_tui_class("amc-statview-label-str", "STR:");
    amc_text_to_tui_class("amc-statview-label-dex", "DEX:");
    amc_text_to_tui_class("amc-statview-label-int", "INT:");
    amc_text_to_tui_class("amc-statview-label-wis", "WIS:");
    amc_text_to_tui_class("amc-statview-label-con", "CON:");

    if (msdp.lists.REPORTABLE_VARIABLES !== null) {
        for (let i=0; i<msdp.lists.REPORTABLE_VARIABLES.length; ++i) {
            let key = msdp.lists.REPORTABLE_VARIABLES[i];

            if (key in msdp.variables && msdp.variables[key] !== null) {
                msdp_update_variable(key, msdp.variables[key]);
            }
        }
    }
}

function amc_create_chatview() {
    if (document.getElementById("amc-chatview") !== null
    ||  global.offscreen.chatview !== null) {
        bug();
        return;
    }

    var chatview = document.createElement("div");

    chatview.id = "amc-chatview";

    global.offscreen.chatview = chatview;
}

function amc_create_inputbar() {
    if (document.getElementById("amc-inputbar") !== null
    ||  global.offscreen.inputbar !== null) {
        bug();
        return;
    }

    var inputbar = document.createElement("input");

    inputbar.id = "amc-inputbar";
    inputbar.setAttribute("type", "text");
    inputbar.setAttribute("placeholder", "enter command here");

    inputbar.addEventListener(
        "keydown", (event) => {
            if (event.key === "Enter") {
                amc_print(
                    event.target.value+"\n",
                    {
                        italic: true,
                        fg: "yellow"
                    }
                );

                amc_send_command(event.target.value);
                event.target.select();
            }
        }
    );

    global.offscreen.inputbar = inputbar;
}

function amc_create_terminal() {
    if (document.getElementById("amc-terminal") !== null
    ||  global.offscreen.terminal !== null) {
        bug();
        return;
    }

    var terminal = document.createElement("div");

    terminal.id = "amc-terminal";

    global.offscreen.terminal = terminal;
}
