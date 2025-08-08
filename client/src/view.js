"use strict";

function amc_init_foreview(container) {
    let wrapper_id = "amc-foreview-wrapper";

    if (container === null) {
        return;
    }

    if (document.getElementById(wrapper_id) !== null) {
        bug();
        return;
    }

    let model_w = parseInt(container.getAttribute("colspan"), 10) - 2;
    let model_h = parseInt(container.getAttribute("rowspan"), 10) - 1;

    if (model_w <= 1 || model_h <= 1) {
        return;
    }

    let model = {
        width    : model_w,
        height   : model_h,
        vertical : true,
        contents : [
            {
                key: "amc-panel-chatview",
                min_h: 1,
                min_w: 1,
                priority : 0
            },
            {
                key: "amc-panel-miscview",
                min_h: 1,
                min_w: 1,
                priority : 1
            }
        ]
    };

    let panel = amc_create_panel(amc_create_panel_framework(model));
    var wrapper = document.createElement("div");

    wrapper.id = wrapper_id;
    wrapper.appendChild(panel);
    container.appendChild(wrapper);
}

function amc_init_terminal(container) {
    if (container !== null && global.offscreen.terminal !== null) {
        var wrapper = document.createElement("div");
        wrapper.id = global.offscreen.terminal.id+"-wrapper";
        wrapper.append(document.createElement("span"));
        wrapper.append(global.offscreen.terminal);
        wrapper.addEventListener(
            'scroll',
            function(e) {
                amc_update_scroll();
            }
        );

        container.append(wrapper);
        global.offscreen.terminal = null;

        scroll_to_bottom(wrapper.id);
    }
}

function amc_deinit_terminal() {
    if (global.offscreen.terminal === null) {
        let view = document.getElementById("amc-terminal");

        if (view !== null) {
            view.parentNode.removeChild(view);
            global.offscreen.terminal = view;
        }

        let wrap = document.getElementById(view.id+"-wrapper");

        if (wrap !== null) {
            wrap.parentNode.removeChild(wrap);
        }
    }
}

function amc_init_chatview(container) {
    if (container !== null && global.offscreen.chatview !== null) {
        var wrapper = document.createElement("div");
        wrapper.id = global.offscreen.chatview.id+"-wrapper";
        wrapper.append(global.offscreen.chatview);
        container.append(wrapper);
        global.offscreen.chatview = null;
    }
}

function amc_deinit_chatview() {
    if (global.offscreen.chatview === null) {
        var view = document.getElementById("amc-chatview");

        if (view !== null) {
            view.parentNode.removeChild(view);
            global.offscreen.chatview = view;
        }

        let wrap = document.getElementById(view.id+"-wrapper");

        if (wrap !== null) {
            wrap.parentNode.removeChild(wrap);
        }
    }
}

function amc_init_inputbar(container) {
    if (container !== null && global.offscreen.inputbar !== null) {
        var wrapper = document.createElement("div");
        wrapper.id = global.offscreen.inputbar.id+"-wrapper";
        wrapper.append(global.offscreen.inputbar);
        container.append(wrapper);
        global.offscreen.inputbar = null;
    }
}

function amc_deinit_inputbar() {
    if (global.offscreen.inputbar === null) {
        var view = document.getElementById("amc-inputbar");

        if (view !== null) {
            view.parentNode.removeChild(view);
            global.offscreen.inputbar = view;
        }

        let wrap = document.getElementById(view.id+"-wrapper");

        if (wrap !== null) {
            wrap.parentNode.removeChild(wrap);
        }
    }
}

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
