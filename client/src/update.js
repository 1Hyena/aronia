"use strict";

function amc_update_mainview_sectors(msdp_var) {
    let mainview = document.getElementById("amc-mainview");

    if (mainview === null) {
        return;
    }

    let msdp_var_to_class_map = {
        SECTOR:     "amc-mainview-room-origin",
        SECTOR_N:   "amc-mainview-room-n",
        SECTOR_S:   "amc-mainview-room-s",
        SECTOR_E:   "amc-mainview-room-e",
        SECTOR_W:   "amc-mainview-room-w",
        SECTOR_NE:  "amc-mainview-room-ne",
        SECTOR_NW:  "amc-mainview-room-nw",
        SECTOR_SE:  "amc-mainview-room-se",
        SECTOR_SW:  "amc-mainview-room-sw"
    };

    if (msdp_var in msdp_var_to_class_map == false) {
        bug();
        return;
    }

    let exit_class_map = {
        "amc-mainview-room-exit-n": null,
        "amc-mainview-room-exit-s": null,
        "amc-mainview-room-exit-e": null,
        "amc-mainview-room-exit-w": null,
        "amc-mainview-room-exit-u": null,
        "amc-mainview-room-exit-d": null
    };

    let sector_type = msdp.variables[msdp_var];

    let elements = mainview.getElementsByClassName(
        msdp_var_to_class_map[msdp_var]
    );

    for (let i=0; i<elements.length; ++i) {
        let el = elements[i];

        if (sector_type !== "") {
            if (el.getAttribute("data-sector") !== sector_type) {
                el.setAttribute("data-sector", sector_type);
            }

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
        else {
            if (el.hasAttribute("data-sector")) {
                el.removeAttribute("data-sector");
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

function amc_update_mainview_exits(msdp_var) {
    let mainview = document.getElementById("amc-mainview");

    if (mainview === null) {
        return;
    }

    let direction_to_class_map = {
        N: "amc-mainview-room-exit-n",
        S: "amc-mainview-room-exit-s",
        E: "amc-mainview-room-exit-e",
        W: "amc-mainview-room-exit-w",
        U: "amc-mainview-room-exit-u",
        D: "amc-mainview-room-exit-d"
    };

    let msdp_var_to_class_map = {
        EXITS:      ["amc-mainview-room-origin", msdp.variables.SECTOR       ],
        EXITS_N:    ["amc-mainview-room-n",      msdp.variables.SECTOR_N     ],
        EXITS_S:    ["amc-mainview-room-s",      msdp.variables.SECTOR_S     ],
        EXITS_E:    ["amc-mainview-room-e",      msdp.variables.SECTOR_E     ],
        EXITS_W:    ["amc-mainview-room-w",      msdp.variables.SECTOR_W     ],
        EXITS_NE:   ["amc-mainview-room-ne",     msdp.variables.SECTOR_NE    ],
        EXITS_NW:   ["amc-mainview-room-nw",     msdp.variables.SECTOR_NW    ],
        EXITS_SE:   ["amc-mainview-room-se",     msdp.variables.SECTOR_SE    ],
        EXITS_SW:   ["amc-mainview-room-sw",     msdp.variables.SECTOR_SW    ]
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

function amc_update_zoneview(msdp_var) {
    if (msdp_var in msdp.variables == false) {
        bug();
        return;
    }

    if ("MAP" in msdp.variables == false) {
        bug();
        return;
    }

    let msdp_map = msdp.variables["MAP"];
    let zoneview = document.getElementById("amc-zoneview");

    if (zoneview === null || msdp_map === null) {
        return;
    }

    let cols = parseInt(zoneview.getAttribute("data-width"), 10);
    let rows = parseInt(zoneview.getAttribute("data-height"), 10);

    let map = new Array(rows);

    for (let y = 0; y < map.length; ++y) {
        map[y] = new Array(cols);
        map[y].fill(" ");
    }

    let scale_y = Math.ceil(rows / 16);
    let scale_x = Math.ceil(cols / 32);
    let scale = Math.max(scale_x, scale_y);

    let xorigin = parseInt(zoneview.getAttribute("data-xorigin"), 10);
    let yorigin = parseInt(zoneview.getAttribute("data-yorigin"), 10);

    for (let i=0; i<msdp_map.length; ++i) {
        let room = msdp_map[i];

        if (room.vnum === msdp.variables.ROOM_VNUM) {
            let new_xorigin = parseInt(room.x, 10);
            let new_yorigin = parseInt(room.y, 10);

            if (xorigin != new_xorigin) {
                xorigin = new_xorigin;
                zoneview.setAttribute("data-xorigin", xorigin);
            }

            if (yorigin != new_yorigin) {
                yorigin = new_yorigin;
                zoneview.setAttribute("data-yorigin", yorigin);
            }

            break;
        }
    }

    xorigin *= 2 * scale;
    yorigin *= scale;

    xorigin = Math.max(xorigin, Math.ceil(cols / 2));
    xorigin = Math.min(xorigin, 16 * 2 * scale - Math.ceil(cols / 2));

    yorigin = Math.max(yorigin, Math.ceil(rows / 2));
    yorigin = Math.min(yorigin, 16 * scale - Math.ceil(rows / 2));

    let translate_x = Math.floor(cols / 2) - xorigin;
    let translate_y = Math.floor(rows / 2) - yorigin;

    for (let i=0; i<msdp_map.length; ++i) {
        let room = msdp_map[i];
        let x = (parseInt(room.x, 10) * 2 * scale) + translate_x;
        let y = (parseInt(room.y, 10) * scale) + translate_y;

        if (x >= cols || y >= rows || x < 0 || y < 0) {
            continue;
        }

        let exits = [...room.exits];

        exits = Object.fromEntries(exits.map(key => [key, undefined]));

        let bits = 0;

        if ("N" in exits) bits += 0b0001; // north
        if ("S" in exits) bits += 0b0010; // south
        if ("E" in exits) bits += 0b0100; // east
        if ("W" in exits) bits += 0b1000; // west

        let symbol = " ";

        if ("U" in exits || "D" in exits) {
            switch (bits) {
                case 0b0001: symbol = "╹"; break;
                case 0b0010: symbol = "╻"; break;
                case 0b0100: symbol = "╺"; break;
                case 0b1000: symbol = "╸"; break;
                case 0b0011: symbol = "┃"; break;
                case 0b0101: symbol = "┗"; break;
                case 0b0110: symbol = "┏"; break;
                case 0b0111: symbol = "┣"; break;
                case 0b1001: symbol = "┛"; break;
                case 0b1010: symbol = "┓"; break;
                case 0b1011: symbol = "┫"; break;
                case 0b1100: symbol = "━"; break;
                case 0b1101: symbol = "┻"; break;
                case 0b1110: symbol = "┳"; break;
                case 0b1111: symbol = "╋"; break;
                default: break;
            }
        }
        else {
            switch (bits) {
                case 0b0001: symbol = "╵"; break;
                case 0b0010: symbol = "╷"; break;
                case 0b0100: symbol = "╶"; break;
                case 0b1000: symbol = "╴"; break;
                case 0b0011: symbol = "│"; break;
                case 0b0101: symbol = "└"; break;
                case 0b0110: symbol = "┌"; break;
                case 0b0111: symbol = "├"; break;
                case 0b1001: symbol = "┘"; break;
                case 0b1010: symbol = "┐"; break;
                case 0b1011: symbol = "┤"; break;
                case 0b1100: symbol = "─"; break;
                case 0b1101: symbol = "┴"; break;
                case 0b1110: symbol = "┬"; break;
                case 0b1111: symbol = "┼"; break;
                default: break;
            }
        }

        map[y][x] = symbol;
    }

    var tunneler = function(field, x, y, dx, dy, symbol) {
        while (y >= 0 && y < field.length && x >= 0 && x < field[y].length) {
            if (field[y][x] !== " ") {
                break;
            }

            field[y][x] = symbol;

            x += dx;
            y += dy;
        }
    };

    let refresh = true;

    for (let i=0; i<msdp_map.length; ++i) {
        let room = msdp_map[i];
        let x = (parseInt(room.x, 10) * 2 * scale) + translate_x;
        let y = (parseInt(room.y, 10) * scale) + translate_y;

        if (x >= cols || y >= rows || x < 0 || y < 0) {
            continue;
        }

        let exits = [...room.exits];

        exits = Object.fromEntries(exits.map(key => [key, undefined]));

        if ("N" in exits) tunneler(map, x, y - 1, 0, -1,    "│");
        if ("S" in exits) tunneler(map, x, y + 1, 0, 1,     "│");
        if ("E" in exits) tunneler(map, x + 1, y, 1, 0,     "─");
        if ("W" in exits) tunneler(map, x - 1, y, -1, 0,    "─");

        if (room.vnum === msdp.variables.ROOM_VNUM) {
            map[y][x] = "@";

            if (y > scale
            && y + scale < map.length
            && x > 2 * scale
            && x + 2 * scale < map[y].length) {
                refresh = false;
            }
        }
    }

    let view = new DocumentFragment();
    let text = "";

    for (let y=0; y<map.length; ++y) {
        for (let x=0; x<map[y].length; ++x) {
            let char = map[y][x];

            text += char;
        }

        text += "\n";
    }

    view.appendChild(document.createTextNode(text));

    zoneview.replaceChildren(view);

    if (refresh) {
        if (zoneview.hasAttribute("data-refresh")) {
            zoneview.removeAttribute("data-refresh");
            msdp_send_variable("MAP");
        }
    }
    else {
        if (!zoneview.hasAttribute("data-refresh")) {
            zoneview.setAttribute("data-refresh", '');
        }
    }
}

function amc_update_roomview(msdp_var) {
    let msdp_var_to_id_map = {
        ROOM_NAME: "amc-roomview-name",
        ROOM_DESC: "amc-roomview-desc",
        EXIT_INFO: "amc-roomview-exit-info",
        ROOM_ITEM_LIST: "amc-roomview-item-list",
        ROOM_CHAR_LIST: "amc-roomview-char-list"
    };

    if (msdp_var in msdp_var_to_id_map == false
    ||  msdp_var in msdp.variables == false
    ||  msdp.variables[msdp_var] === null) {
        bug();
        return;
    }

    let el = document.getElementById(msdp_var_to_id_map[msdp_var]);

    if (el === null) {
        return;
    }

    switch (msdp_var) {
        case "ROOM_NAME": {
            let roomview = document.getElementById("amc-roomview");

            if (msdp.variables[msdp_var] == false) {
                if (roomview.hasAttribute("data-room")) {
                    roomview.removeAttribute("data-room");
                }
            }
            else {
                let roomname = msdp.variables[msdp_var];
                let fragment = new DocumentFragment();

                terminal_data_to_node(roomname, fragment);

                roomname = fragment.textContent;

                if (roomview.getAttribute("data-room") !== roomname) {
                    roomview.setAttribute("data-room", roomname);
                }

                fragment.appendChild(document.createTextNode("\n"));

                el.replaceChildren(fragment);
            }

            break;
        }
        case "ROOM_DESC": {
            let roomdesc = msdp.variables[msdp_var];
            let fragment = new DocumentFragment();

            terminal_data_to_node(roomdesc, fragment);
            roomdesc = fragment.textContent;

            if (el.textContent !== roomdesc) {
                el.replaceChildren(fragment);
            }

            break;
        }
        case "ROOM_ITEM_LIST":
        case "ROOM_CHAR_LIST": {
            let list = msdp.variables[msdp_var];

            if (list == false) {
                list = [];
            }

            if (list.length > 0) {
                list = "\n"+list.join("\n");

                let fragment = new DocumentFragment();

                terminal_data_to_node(list, fragment);
                list = fragment.textContent;

                if (el.textContent !== list) {
                    el.replaceChildren(fragment);
                }
            }
            else if (el.textContent !== "") {
                el.replaceChildren();
            }

            break;
        }
        case "EXIT_INFO": {
            let exits = ["north", "east", "south", "west", "up", "down", "none"];
            let exit_info = msdp.variables[msdp_var];
            let exit_count = 0;

            for (let i=0; i<exits.length; ++i) {
                let exit_label = exits[i];
                let id = "amc-roomview-exit-" + exit_label;
                let span_wrapper = document.getElementById(id);
                let span_prefix = document.getElementById(id+"-prefix");
                let span_label = document.getElementById(id+"-label");
                let span_suffix = document.getElementById(id+"-suffix");

                let old_prefix = span_prefix.textContent;
                let old_label = span_label.textContent;
                let old_suffix = span_suffix.textContent;

                let new_prefix = "";
                let new_label = "";
                let new_suffix = "";

                let exit_flags = {};

                if (exit_label === "none") {
                    if (exit_count === 0) {
                        new_label = exit_label;
                    }
                }
                else if (exit_label in exit_info) {
                    new_label = exits[i];

                    if ("sector" in exit_info[exit_label]) {
                        let sector = exit_info[exit_label].sector;

                        if (sector === "road") {
                            new_prefix = "=";
                            new_suffix = "=";
                        }
                    }

                    if ("flags" in exit_info[exit_label]) {
                        exit_flags = Object.fromEntries(
                            exit_info[exit_label].flags.split(" ").map(
                                k => [k, undefined]
                            )
                        );

                        if ("closed" in exit_flags) {
                            new_prefix = "[";
                            new_suffix = "]";
                        }
                        else if ("door" in exit_flags) {
                            new_prefix = "(";
                            new_suffix = ")";
                        }

                        if (new_prefix === "" && new_suffix === "") {
                            if ("sunny" in exit_flags) {
                                new_prefix = "*";
                                new_suffix = "*";
                            }
                            else if ("dark" in exit_flags) {
                                new_prefix = ":";
                                new_suffix = ":";
                            }
                            else if ("lit" in exit_flags) {
                                new_prefix = "^";
                                new_suffix = "^";
                            }
                        }
                    }

                    if (exit_count++ > 0) {
                        new_prefix = " "+new_prefix;
                    }
                }

                if (old_prefix !== new_prefix) {
                    span_prefix.replaceChildren(
                        document.createTextNode(new_prefix)
                    );
                }

                if (old_label !== new_label) {
                    span_label.replaceChildren(
                        document.createTextNode(new_label)
                    );
                }

                if (old_suffix !== new_suffix) {
                    span_suffix.replaceChildren(
                        document.createTextNode(new_suffix)
                    );
                }

                let fixes = [ span_prefix, span_suffix ];
                let lighting = "lit";

                if ("closed" in exit_flags) {
                    lighting = "unknown";
                }
                else if ("sunny" in exit_flags) {
                    lighting = "sunny";
                }
                else if ("dark" in exit_flags) {
                    lighting = "dark";
                }

                for (let i=0; i<fixes.length; ++i) {
                    let span = fixes[i];

                    if (lighting === "sunny") {
                        span.classList.remove("ans-fg-black");
                        span.classList.add("ans-fg-yellow", "ans-fg", "ans-b");
                    }
                    else if (lighting === "dark") {
                        span.classList.remove("ans-fg-yellow");
                        span.classList.add("ans-fg-black", "ans-fg", "ans-b");
                    }
                    else {
                        span.classList.remove("ans-fg-yellow", "ans-fg-black");
                    }
                }
            }

            break;
        }
        default: {
            bug();
            break;
        }
    }
}

function amc_update_statview_character_title() {
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

function amc_update_statview_health_bar() {
    let classname = "amc-statview-health-bar";
    let cells = document.getElementsByClassName(classname).length;
    let health = msdp.variables.HEALTH && msdp.variables.HEALTH_MAX > 0 ? (
        parseInt(msdp.variables.HEALTH) / parseInt(msdp.variables.HEALTH_MAX)
    ) : 0;
    let left = Math.max(Math.min(Math.floor(health * cells), cells), 0);
    let bar = "▒".repeat(left)+"░".repeat(cells - left);

    amc_text_to_tui_class(classname, bar);
}

function amc_update_statview_energy_bar() {
    let classname = "amc-statview-energy-bar";
    let cells = document.getElementsByClassName(classname).length;
    let energy = msdp.variables.ENERGY && msdp.variables.ENERGY_MAX > 0 ? (
        parseInt(msdp.variables.ENERGY) / parseInt(msdp.variables.ENERGY_MAX)
    ) : 0;
    let left = Math.max(Math.min(Math.floor(energy * cells), cells), 0);
    let bar = "▒".repeat(left)+"░".repeat(cells - left);

    amc_text_to_tui_class(classname, bar);
}

function amc_update_statview_xp_bar() {
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

function amc_update_statview_xp() {
    amc_update_statview_xp_bar();

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
