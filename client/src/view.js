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

function amc_view_update_sectors(msdp_var) {
    let mainview = document.getElementById("amc-mainview");

    if (mainview === null) {
        return;
    }

    let msdp_var_to_class_map = {
        SECTOR:     "amc-room-origin",
        SECTOR_N:   "amc-room-n",
        SECTOR_S:   "amc-room-s",
        SECTOR_E:   "amc-room-e",
        SECTOR_W:   "amc-room-w",
        SECTOR_NE:  "amc-room-ne",
        SECTOR_NW:  "amc-room-nw",
        SECTOR_SE:  "amc-room-se",
        SECTOR_SW:  "amc-room-sw"
    };

    if (msdp_var in msdp_var_to_class_map == false) {
        bug();
        return;
    }

    let exit_class_map = {
        "amc-room-exit-n": null,
        "amc-room-exit-s": null,
        "amc-room-exit-e": null,
        "amc-room-exit-w": null
    };

    let sector_type = msdp.variables[msdp_var];

    let elements = mainview.getElementsByClassName(
        msdp_var_to_class_map[msdp_var]
    );

    for (let i=0; i<elements.length; ++i) {
        let el = elements[i];

        if (sector_type !== "") {
            let classes = el.className.split(" ");
            let found = false;

            for (let j=0; j<classes.length; ++j) {
                if (classes[j] in exit_class_map) {
                    found = true;
                    break;
                }
            }

            if (found) {
                continue;
            }
        }

        let oldval = el.textContent;
        let newval = " ";

        if (sector_type !== "") {
            newval = el.getAttribute("data-symbol");
        }

        if (newval !== oldval) {
            el.replaceChildren(document.createTextNode(newval));
        }
    }
}

function amc_view_update_exits(msdp_var) {
    let mainview = document.getElementById("amc-mainview");

    if (mainview === null) {
        return;
    }

    let direction_to_class_map = {
        N: "amc-room-exit-n",
        S: "amc-room-exit-s",
        E: "amc-room-exit-e",
        W: "amc-room-exit-w"
    };

    let msdp_var_to_class_map = {
        EXITS:      ["amc-room-origin", msdp.variables.SECTOR       ],
        EXITS_N:    ["amc-room-n",      msdp.variables.SECTOR_N     ],
        EXITS_S:    ["amc-room-s",      msdp.variables.SECTOR_S     ],
        EXITS_E:    ["amc-room-e",      msdp.variables.SECTOR_E     ],
        EXITS_W:    ["amc-room-w",      msdp.variables.SECTOR_W     ],
        EXITS_NE:   ["amc-room-ne",     msdp.variables.SECTOR_NE    ],
        EXITS_NW:   ["amc-room-nw",     msdp.variables.SECTOR_NW    ],
        EXITS_SE:   ["amc-room-se",     msdp.variables.SECTOR_SE    ],
        EXITS_SW:   ["amc-room-sw",     msdp.variables.SECTOR_SW    ]
    };

    if (msdp_var in msdp_var_to_class_map == false) {
        bug();
        return;
    }

    let exits = msdp.variables[msdp_var] ? [...msdp.variables[msdp_var]] : [];

    exits = Object.fromEntries(exits.map(i => [i, undefined]));

    for (const [key, value] of Object.entries(direction_to_class_map)) {
        let elements = mainview.getElementsByClassName(
            msdp_var_to_class_map[msdp_var][0]+" "+value
        );

        for (let i=0; i<elements.length; ++i) {
            let el = elements[i];
            let oldval = el.textContent;
            let newval = " ";

            if (msdp_var_to_class_map[msdp_var][1]
            ||  msdp.variables[msdp_var]) {
                if (key in exits) {
                    newval = el.getAttribute("data-symbol");
                }
                else {
                    switch (el.getAttribute("data-symbol")) {
                        default: break;
                        case "┴": newval = "─"; break;
                        case "┬": newval = "─"; break;
                        case "┤": newval = "│"; break;
                        case "├": newval = "│"; break;
                        case "─": break;
                        case "│": break;
                    }
                }
            }

            if (newval !== oldval) {
                el.replaceChildren(document.createTextNode(newval));
            }
        }
    }
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
        document.createTextNode(amc_tui_get_equipment_placeholder())
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

    var placeholder = document.createElement("pre");

    placeholder.appendChild(
        document.createTextNode(amc_tui_get_roomview_placeholder())
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

    if (msdp.lists.REPORTABLE_VARIABLES !== null) {
        for (let i=0; i<msdp.lists.REPORTABLE_VARIABLES.length; ++i) {
            let key = msdp.lists.REPORTABLE_VARIABLES[i];

            if (key in msdp.variables && msdp.variables[key] !== null) {
                msdp_update_variable(key, msdp.variables[key]);
            }
        }
    }
}

function amc_view_update_character_title() {
    let value = "";

    if (msdp.variables.CHARACTER_NAME !== null) {
        value = capitalize(msdp.variables.CHARACTER_NAME);

        if (msdp.variables.CHARACTER_RACE || msdp.variables.CHARACTER_CLASS) {
            value += ",";

            if (msdp.variables.CHARACTER_RACE) {
                value += " "+capitalize(msdp.variables.CHARACTER_RACE);
            }

            if (msdp.variables.CHARACTER_CLASS) {
                value += " "+capitalize(msdp.variables.CHARACTER_CLASS);
            }
        }
    }

    let classname = "amc-statview-title";
    let cells = document.getElementsByClassName(classname).length;
    let padding_left = Math.max(Math.floor((cells - value.length) / 2), 0);
    let padding_right = Math.max((cells - value.length) - padding_left, 0);
    let title = " ".repeat(padding_left)+value+" ".repeat(padding_right);

    amc_text_to_tui_class(classname, title);
    amc_text_to_tui_class(
        "amc-statview-title-underline",
        " ".repeat(padding_left)+
        "╌".repeat(value.length)+
        " ".repeat(padding_right)
    );
}

function amc_view_update_health_bar() {
    let classname = "amc-statview-health-bar";
    let cells = document.getElementsByClassName(classname).length;
    let health = msdp.variables.HEALTH && msdp.variables.HEALTH_MAX > 0 ? (
        parseInt(msdp.variables.HEALTH) / parseInt(msdp.variables.HEALTH_MAX)
    ) : 0;
    let left = Math.max(Math.min(Math.floor(health * cells), cells), 0);
    let bar = "▒".repeat(left)+"░".repeat(cells - left);

    amc_text_to_tui_class(classname, bar);
}

function amc_view_update_energy_bar() {
    let classname = "amc-statview-energy-bar";
    let cells = document.getElementsByClassName(classname).length;
    let energy = msdp.variables.ENERGY && msdp.variables.ENERGY_MAX > 0 ? (
        parseInt(msdp.variables.ENERGY) / parseInt(msdp.variables.ENERGY_MAX)
    ) : 0;
    let left = Math.max(Math.min(Math.floor(energy * cells), cells), 0);
    let bar = "▒".repeat(left)+"░".repeat(cells - left);

    amc_text_to_tui_class(classname, bar);
}

function amc_view_update_xp_bar() {
    let classname = "amc-statview-xp-bar";

    if (!(msdp.variables.EXPERIENCE_TNL >= 0 && msdp.variables.LEVEL >= 0)) {
        amc_text_to_tui_class(
            classname,
            msdp.variables.EXPERIENCE !== null ? msdp.variables.EXPERIENCE : "",
            "right"
        );

        return;
    }

    let cells = document.getElementsByClassName(classname).length;
    let xp = (
        msdp.variables.EXPERIENCE_TNL >= 0 &&
        msdp.variables.EXPERIENCE_TNL_MAX > 0 ? (
            parseInt(msdp.variables.EXPERIENCE_TNL) /
            parseInt(msdp.variables.EXPERIENCE_TNL_MAX)
        ) : 0
    );
    let left = cells - Math.max(Math.min(Math.floor(xp * cells), cells), 0);
    let bar = "▒".repeat(left)+"░".repeat(cells - left);

    amc_text_to_tui_class(classname, bar);
}

function amc_view_update_xp() {
    amc_view_update_xp_bar();

    let classname = "amc-statview-label-xp";
    let cells = document.getElementsByClassName(classname).length;
    let label = (
        msdp.variables.EXPERIENCE_TNL >= 0 && msdp.variables.LEVEL >= 0 ? (
            msdp.variables.EXPERIENCE_TNL +
            " Xp → Lvl " + (parseInt(msdp.variables.LEVEL) + 1) + ":"
        ) : "Experience:"
    );

    amc_text_to_tui_class(classname, label);
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
