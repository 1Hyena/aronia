"use strict";

function amc_init_noteview(container, contents) {
    if (container === null) {
        return;
    }

    if (document.getElementById("amc-noteview-wrapper") !== null) {
        return;
    }

    var wrapper = document.createElement("div");

    wrapper.id = "amc-noteview-wrapper";

    var noteview = document.createElement("div");

    noteview.id = "amc-noteview";

    wrapper.appendChild(noteview);

    if (contents !== null) {
        noteview.appendChild(contents);
    }

    container.replaceChildren(wrapper);
}

function amc_init_mainview(container) {
    if (container === null) {
        return;
    }

    if (document.getElementById("amc-mainview-wrapper") !== null) {
        return;
    }

    var wrapper = document.createElement("div");

    wrapper.id = "amc-mainview-wrapper";

    wrapper.appendChild(
        amc_tui_create_mainview(
            parseInt(container.getAttribute("colspan"), 10),
            parseInt(container.getAttribute("rowspan"), 10)
        )
    );

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
        document.createTextNode(amc_tui_get_secondary_top_placeholder())
    );

    wrapper.appendChild(placeholder);

    container.appendChild(wrapper);
}

function amc_init_gearview(container) {
    if (container === null) {
        return;
    }

    if (document.getElementById("amc-gearview-wrapper") !== null) {
        bug();
        return;
    }

    var wrapper = document.createElement("div");

    wrapper.id = "amc-gearview-wrapper";

    var placeholder = document.createElement("pre");

    placeholder.appendChild(
        document.createTextNode(amc_tui_get_equipment_placeholder())
    );

    wrapper.appendChild(placeholder);

    container.appendChild(wrapper);
}

function amc_init_itemview(container) {
    if (container === null) {
        return;
    }

    if (document.getElementById("amc-itemview-wrapper") !== null) {
        bug();
        return;
    }

    var wrapper = document.createElement("div");

    wrapper.id = "amc-itemview-wrapper";

    var placeholder = document.createElement("pre");

    placeholder.appendChild(
        document.createTextNode(amc_tui_get_inventory_placeholder())
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

    wrapper.appendChild(amc_tui_create_roomview());

    container.replaceChildren(wrapper);
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

    wrapper.appendChild(amc_tui_create_statview());

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
