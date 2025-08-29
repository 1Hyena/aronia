"use strict";


function amc_update_timeview(msdp_var) {
    if (msdp_var !== "WORLD_TIME") {
        return;
    }

    let el = document.getElementById("amc-timeview");

    if (el === null) {
        return;
    }

    let cols = parseInt(el.getAttribute("data-colspan"), 10);
    let hour = parseInt(msdp.variables[msdp_var].split(":")[0], 10);

    let ansi = (
        hour ===  6 ? "\x1B[1;33m" :
        hour === 19 ? "\x1B[0;31m" :
        hour   > 19 || hour < 6 ? "\x1B[0;34m" : ""
    );

    let value = (hour <= 12 ? hour : hour - 12) + (hour < 12 ? " AM " : " PM ");
    let symbols = [...value];

    symbols.splice(cols);

    let time = symbols.join("").padStart(cols, " ");

    let fragment = new DocumentFragment();

    terminal_data_to_node(ansi+time, fragment);

    el.replaceChildren(fragment);
}

function amc_update_gearview(msdp_var) {
    let msdp_var_to_id_map = {
        CHAR_ITEM_LIST: "amc-gearview"
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
        case "CHAR_ITEM_LIST": {
            let list = msdp.variables[msdp_var];

            if (list == false) {
                list = [];
            }

            if (list.length > 0) {
                list = list.join("\n");

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
        default: {
            bug();
            break;
        }
    }
}

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
    let msdp_area= msdp.variables["AREA_NAME"];

    let zoneview = document.getElementById("amc-zoneview");

    if (zoneview === null || msdp_map === null) {
        return;
    }

    if (msdp_area === null) {
        msdp_area = "";
    }

    let cols = parseInt(zoneview.getAttribute("data-width"), 10);
    let rows = parseInt(zoneview.getAttribute("data-height"), 10);

    var translator = function(setup, room_x, room_y) {
        let cols = setup.cols;
        let rows = setup.rows;
        let origin_x = setup.origin.x;
        let origin_y = setup.origin.y;

        let scale_y = Math.ceil(rows / 16);
        let scale_x = Math.ceil(cols / 32);
        let scale = Math.max(scale_x, scale_y);

        origin_x *= 2 * scale;
        origin_y *= scale;

        origin_x = Math.max(origin_x, Math.ceil(cols / 2));
        origin_x = Math.min(origin_x, 16 * 2 * scale - Math.ceil(cols / 2));

        origin_y = Math.max(origin_y, Math.ceil(rows / 2));
        origin_y = Math.min(origin_y, 16 * scale - Math.ceil(rows / 2));

        let translate_x = Math.floor(cols / 2) - origin_x;
        let translate_y = Math.floor(rows / 2) - origin_y;

        return {
            x : (room_x * 2 * scale) + translate_x,
            y : (room_y * scale) + translate_y,
            scale : {
                x : 2 * scale,
                y : scale
            }
        };
    }

    let map = new Array(rows);

    for (let y = 0; y < map.length; ++y) {
        map[y] = new Array(cols);
        map[y].fill("");
    }

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

    let translation_setup = {
        cols : cols,
        rows : rows,
        origin: {
            x: xorigin,
            y: yorigin
        }
    };

    for (let i=0; i<msdp_map.length; ++i) {
        let room = msdp_map[i];
        let translation = translator(
            translation_setup, parseInt(room.x, 10), parseInt(room.y, 10)
        );
        let x = translation.x;
        let y = translation.y;

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

        let symbol = "";

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

    var tunneler = function(field, x, y, dx, dy, symbol, roads) {
        let tunnel = [];
        let end_key = "";

        while (y >= 0 && y < field.length && x >= 0 && x < field[y].length) {
            if (field[y][x] !== "") {
                end_key = x+"-"+y;

                break;
            }

            tunnel.push(
                {
                    x: x,
                    y: y
                }
            );

            x += dx;
            y += dy;
        }

        let prefix = "";
        let suffix = "";

        if (roads !== null && end_key in roads) {
            prefix = "\x1B[0;31m";
            suffix = "\x1B[0m";
        }

        while (tunnel.length > 0) {
            let pos = tunnel.pop();

            field[pos.y][pos.x] = prefix + symbol + suffix;
        }
    };

    let refresh = true;
    let decoration_queue = [];
    let road_positions = {};

    for (let i=0; i<msdp_map.length; ++i) {
        let room = msdp_map[i];

        if (room.sector !== "road") {
            continue;
        }

        let translation = translator(
            translation_setup, parseInt(room.x, 10), parseInt(room.y, 10)
        );
        let x = translation.x;
        let y = translation.y;

        if (x >= cols || y >= rows || x < 0 || y < 0) {
            continue;
        }

        let key = x+"-"+y;
        road_positions[key] = undefined;

        let room_symbol = map[y][x];
        let prefix = "\x1B[0;31m";
        let suffix = "\x1B[0m";

        map[y][x] = prefix + room_symbol + suffix;
    }

    for (let i=0; i<msdp_map.length; ++i) {
        let room = msdp_map[i];
        let translation = translator(
            translation_setup, parseInt(room.x, 10), parseInt(room.y, 10)
        );
        let x = translation.x;
        let y = translation.y;

        if (x >= cols || y >= rows || x < 0 || y < 0) {
            continue;
        }

        let exits = [...room.exits];

        exits = Object.fromEntries(exits.map(key => [key, undefined]));

        let rp = room.sector === "road" ? road_positions : null;

        if ("N" in exits) tunneler(map, x, y - 1, 0, -1,    "┊", rp );
        if ("S" in exits) tunneler(map, x, y + 1, 0, 1,     "┊", rp );
        if ("E" in exits) tunneler(map, x + 1, y, 1, 0,     "╌", rp );
        if ("W" in exits) tunneler(map, x - 1, y, -1, 0,    "╌", rp );

        if (room.vnum === msdp.variables.ROOM_VNUM) {
            map[y][x] = "\x1B[1;36m@\x1B[0m";

            if (y > translation.scale.y
            && y + translation.scale.y < map.length
            && x > translation.scale.x
            && x + translation.scale.x < map[y].length) {
                refresh = false;
            }
        }

        decoration_queue.push(
            {
                room: room,
                x: x,
                y: y,
                sector: room.sector,
                ttl: {
                    x: translation.scale.x * 2,
                    y: translation.scale.y * 2
                },
                cost : 0,
                sequence : 0
            }
        );
    }

    var decorator = function(field, expansion) {
        let x = expansion.x;
        let y = expansion.y;
        let sector = expansion.sector;
        let ttl = expansion.ttl;
        let room = expansion.room;

        if (y < 0 || y >= field.length || x < 0 || x >= field[y].length) {
            return [];
        }

        let sectors = {
            underground: {
                symbols : [ "▒", "▓" ],
                style: "\x1B[1;30m",
                cost: 3
            },
            inside: {
                symbols : [ " " ],
                cost: Number.MAX_SAFE_INTEGER
            },
            swim: {
                symbols : [ "≈" ],
                style: "\x1B[1;34m",
                cost: Number.MAX_SAFE_INTEGER
            },
            noswim: {
                symbols : [ "≋", "≈" ],
                style: "\x1B[0;34m",
                cost: 3
            },
            shop: {
                symbols : [ "$" ],
                style: "\x1B[0;32m",
                cost: Number.MAX_SAFE_INTEGER
            },
            guild: {
                symbols : [ "%" ],
                style: "\x1B[1;32m",
                cost: Number.MAX_SAFE_INTEGER
            },
            forest: {
                symbols : [ "♠", "♣", "↨", "↟", "↑", "↥", "τ", ".", "." ],
                style: "\x1B[0;32m",
                cost: 1
            },
            desert: {
                symbols : [ "≋", "≈", "≈", "∼", "~", "∼", "~"],
                style: "\x1B[1;33m",
                cost: 1
            },
            field: {
                symbols : [ ".", ":", "ⁿ" ],
                style: "\x1B[1;32m",
                cost: 1
            },
            moors: {
                symbols : [ "\"", "ⁿ", "⌠" ],
                style: "\x1B[0;32m",
                cost: 1
            },
            hills: {
                symbols : [ "n", "∩", " ", " ", " " ],
                style: "\x1B[1;32m",
                cost: 2
            },
            mountain: {
                symbols : [
                    "^", "⌂", "▲", "\x1B[1;30m▲\x1B[0m", " "
                ],
                cost: 2
            },
            city: {
                symbols : [ "Π", "⌂", "⏏", "⌂", "⏏", "⌂", " " ],
                style: "\x1B[1;37m",
                cost: Number.MAX_SAFE_INTEGER
            }
        };

        if (sector in sectors) {
            if (field[y][x] === "") {
                let symbols = sectors[sector].symbols;
                let vnum = parseInt(room.vnum, 10);
                let index = ttl.x + ttl.y * (expansion.sequence + 1) + vnum;
                let symbol = symbols[(index) % symbols.length];
                let prefix = "";
                let suffix = "";

                if ("style" in sectors[sector]) {
                    prefix = sectors[sector].style;
                    suffix = "\x1B[0m";
                }

                field[y][x] = prefix + symbol + suffix;
            }
        }
        else return [];

        let directions = [
            { dx: -1, dy:  0 },
            { dx:  1, dy:  0 },
            { dx:  0, dy:  1 },
            { dx:  0, dy: -1 },
            { dx: -1, dy: -1 },
            { dx:  1, dy: -1 },
            { dx: -1, dy:  1 },
            { dx:  1, dy:  1 }
        ];

        let expansions = [];

        for (let i=0; i<directions.length; ++i) {
            let dir = directions[i];
            let next_x = x + dir.dx;
            let next_y = y + dir.dy;

            if (next_y < 0
            ||  next_y >= field.length
            ||  next_x < 0
            ||  next_x >= field[next_y].length) {
                continue;
            }

            if (field[next_y][next_x] !== "") {
                continue;
            }

            let cost = sectors[sector].cost;

            if ("cost" in expansion) {
                cost = expansion.cost;
            }

            if ("direction" in expansion) {
                if (expansion.direction.dx != dir.dx
                || expansion.direction.dy != dir.dy) {
                    cost *= 2;
                }
            }

            if (cost !== 0 && dir.dx !== 0 && dir.dy !== 0) {
                continue;
            }

            let ttl_x = dir.dx !== 0 ? ttl.x - cost : ttl.x;
            let ttl_y = dir.dy !== 0 ? ttl.y - cost : ttl.y;

            if (ttl_x < 0 || ttl_y < 0) {
                continue;
            }

            expansions.push(
                {
                    room: room,
                    x: next_x,
                    y: next_y,
                    sector: sector,
                    ttl: {
                        x: ttl_x,
                        y: ttl_y
                    },
                    direction: dir,
                    sequence: expansions.length
                }
            );
        }

        return expansions;
    };

    while (decoration_queue.length > 0) {
        let next_queue = {};

        while (decoration_queue.length > 0) {
            let expansion = decoration_queue.pop();
            let expansions = decorator(map, expansion);

            while (expansions.length > 0) {
                let exp = expansions.pop();
                let key = exp.x+"-"+exp.y;

                if (key in next_queue) {
                    continue;
                }

                next_queue[key] = exp;
            }
        }

        for (const [key, value] of Object.entries(next_queue)) {
            decoration_queue.push(value);
        }
    }

    var get_fow_thickness = function(field, x, y) {
        let directions = [
            { dx: -1, dy:  0, level: 1 },
            { dx:  1, dy:  0, level: 1 },
            { dx:  0, dy:  1, level: 1 },
            { dx:  0, dy: -1, level: 1 },
            { dx: -2, dy:  0, level: 3 },
            { dx:  2, dy:  0, level: 3 },
            { dx:  0, dy:  2, level: 3 },
            { dx:  0, dy: -2, level: 3 },
            { dx: -1, dy: -1, level: 2 },
            { dx:  1, dy: -1, level: 2 },
            { dx: -1, dy:  1, level: 2 },
            { dx:  1, dy:  1, level: 2 }
        ];

        let thickness = 0;

        for (let i=0; i<directions.length; ++i) {
            let nx = directions[i].dx + x;
            let ny = directions[i].dy + y;

            if (ny < 0 || ny >= field.length
            ||  nx < 0 || nx >= field[ny].length) {
                thickness += directions[i].level;

                continue;
            }

            if (field[ny][nx] === "") {
                thickness += directions[i].level;
            }
        }

        return thickness;
    }

    let area = [...msdp_area];
    let view = new DocumentFragment();
    let text = "";

    for (let y=0; y<map.length; ++y) {
        for (let x=0; x<map[y].length; ++x) {
            if (y + 1 === map.length
            &&  area.length > 0
            &&  x >= map[y].length - area.length) {
                let pos = x - Math.max(map[y].length - area.length, 0);
                text += area[pos];
                continue;
            }

            let thickness = get_fow_thickness(map, x, y);
            let fogofwar = (
                thickness >= 24 ? "▓" :
                thickness >= 19 ? "▒" :
                thickness >=  8 ? "░" : " "
            );
            let pieces = [ ...map[y][x] ];
            let char = pieces.length === 0 ? fogofwar : map[y][x];

            text += char;
        }

        text += "\n";
    }

    //view.appendChild(document.createTextNode(text));

    terminal_data_to_node(text, view);

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

function amc_update_statview_char_title() {
    let value = "";

    if (msdp.variables.CHAR_NAME !== null) {
        value = capitalize(msdp.variables.CHAR_NAME);

        if (msdp.variables.CHAR_RACE || msdp.variables.CHAR_CLASS) {
            value += ",";

            if (msdp.variables.CHAR_RACE) {
                value += " "+capitalize(msdp.variables.CHAR_RACE);
            }

            if (msdp.variables.CHAR_CLASS) {
                value += " "+capitalize(msdp.variables.CHAR_CLASS);
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

function amc_update_statview_spirit_bar() {
    let classname = "amc-statview-spirit-bar";
    let cells = document.getElementsByClassName(classname).length;
    let spirit = msdp.variables.SPIRIT && msdp.variables.SPIRIT_MAX > 0 ? (
        parseInt(msdp.variables.SPIRIT) / parseInt(msdp.variables.SPIRIT_MAX)
    ) : 0;
    let left = Math.max(Math.min(Math.floor(spirit * cells), cells), 0);
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
