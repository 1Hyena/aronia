"use strict";

function amc_text_to_tui_class(name, text, alignment) {
    alignment = typeof alignment !== 'undefined' ? alignment : "left";

    let live_elements = document.getElementsByClassName(name);
    let elements = [];

    for (let i =0; i<live_elements.length; ++i) {
        elements.push(live_elements[i]);
    }

    if (alignment === "right") {
        elements.reverse();
        text = [...text].reverse().join("");
    }

    for (let i = 0; i < elements.length && i < text.length; ++i) {
        let pre = document.createElement("pre");

        pre.appendChild(document.createTextNode(text.charAt(i)));

        elements[i].replaceChildren(pre);
        elements[i].setAttribute("data-symbol", text.charAt(i));
    }

    for (let i = text.length; i < elements.length; ++i) {
        let pre = document.createElement("pre");

        pre.appendChild(document.createTextNode(" "));

        elements[i].replaceChildren(pre);
        elements[i].setAttribute("data-symbol", " ");
    }
}

/*
function amc_tui_get_roguelike_placeholder() {
    let placeholder =
    "╔══════════════════════╤══╗\n"+
    "║╭───╮     ╭───╮     ╭─┴─╮║\n"+
    "╟┤   ├─────┤  ↑├─────┤   │║\n"+
    "║╰───╯     ╰─┬─╯     ╰───╯║\n"+
    "║      ╭─────┴─────╮      ║\n"+
    "║      │           │      ║\n"+
    "║╭───╮ │           │ ╭─┬─╮║\n"+
    "║│   ├─┤ c   @  k  ├─┼─┼─┤║\n"+
    "║╰─┬─╯ │      kk   │ ╰─┼─╯║\n"+
    "║  │   │           │   │  ║\n"+
    "║  │   ╰───────────╯   │  ║\n"+
    "║╭─┴─╮               ╭─┴─╮║\n"+
    "║│   │               │   │║\n"+
    "║╰─┬─╯               ╰─┬─╯║\n"+
    "╚══╧═══════════════════╧══╝\n";

    return placeholder;
}
*/
function amc_tui_draw_room(map, room) {
    let top_left_x = room.x - Math.floor(room.w/2);
    let top_left_y = room.y - Math.floor(room.h/2);

    for (let y=0; y<room.h; ++y) {
        for (let x=0; x<room.w; ++x) {
            let value = " ";
            let type = null;

            if (x === 0 || y === 0 || x + 1 === room.w || y + 1 === room.h) {
                if (x === 0 && y === 0) {
                    value = "╭";
                }
                else if (x + 1 === room.w && y === 0) {
                    value = "╮";
                }
                else if (x === 0 && y + 1 === room.h) {
                    value = "╰";
                }
                else if (x + 1 === room.w && y + 1 === room.h) {
                    value = "╯";
                }
                else if (x === 0 || x + 1 === room.w) {
                    value = "│";

                    if (y === Math.floor(room.h / 2)) {
                        if (x === 0) {
                            value = "┤";
                            type = "exit-w";
                        }
                        else if (x + 1 === room.w) {
                            value = "├";
                            type = "exit-e";
                        }
                    }
                }
                else if (y === 0 || y + 1 === room.h) {
                    value = "─";

                    if (x === Math.floor(room.w / 2)) {
                        if (y === 0) {
                            value = "┴";
                            type = "exit-n";
                        }
                        else if (y + 1 === room.h) {
                            value = "┬";
                            type = "exit-s";
                        }
                    }
                }
                else value = "?";
            }
            else if (y === Math.floor(room.h/2)) {
                if (x === Math.floor(room.w/2) + 1) {
                    value = "↑";
                    type = "exit-u";
                }
                else if (x === Math.floor(room.w/2) - 1) {
                    value = "↓";
                    type = "exit-d";
                }
            }

            map[top_left_y + y][top_left_x + x] = {
                sector: room.key,
                symbol: value,
                type: type,
                border: true
            };
        }
    }
}

function amc_tui_create_mainview(cols, rows) {
    let mainview = document.createElement("div");

    mainview.id = "amc-mainview";

    let map = new Array(rows);

    for (let y = 0; y < map.length; ++y) {
        map[y] = new Array(cols);
        map[y].fill(null);
    }

    let rw = 5;
    let rh = 3;

    let rooms = [
        {x: 3, y: 1, w: rw, h: rh, key: "nw"},
        {x: Math.floor(cols / 2), y: 1, w: rw, h: rh, key: "n"},
        {x: cols - 4, y: 1, w: rw, h: rh, key: "ne"},
        {x: 3, y: Math.floor(rows / 2), w: rw, h: rh, key: "w"},
        {
            x: Math.floor(cols / 2),
            y: Math.floor(rows / 2),
            w: rw+4,//cols - 12,
            h: rh+2,//rows - 6,
            key: "origin"
        },
        {x: cols - 4, y: Math.floor(rows / 2), w: rw, h: rh, key: "e"},
        {x: 3, y: rows - 2, w: rw, h: rh, key: "sw"},
        {x: Math.floor(cols / 2), y: rows - 2, w: rw, h: rh, key: "s"},
        {x: cols - 4, y: rows - 2, w: rw, h: rh, key: "se"}
    ];

    for (let i=0; i<rooms.length; ++i) {
        let r = rooms[i];

        amc_tui_draw_room(map, r);
    }

    let fill = [];

    for (let y=0; y<map.length; ++y) {
        for (let x=0; x<map[y].length; ++x) {
            if (map[y][x] === null) {
                continue;
            }

            switch (map[y][x].symbol) {
                case "┤": {
                    fill.push([x-1, y, "─", map[y][x]]);
                    break;
                }
                case "├": {
                    fill.push([x+1, y, "─", map[y][x]]);
                    break;
                }
                case "┴": {
                    fill.push([x, y-1, "│", map[y][x]]);
                    break;
                }
                case "┬": {
                    fill.push([x, y+1, "│", map[y][x]]);
                    break;
                }
                default: break;
            }
        }
    }

    while (fill.length > 0) {
        let pos = fill.shift();
        let x = pos[0];
        let y = pos[1];
        let sym = pos[2];
        let src = pos[3];

        if (y < 0 || y >= map.length || x < 0 || x >= map[y].length) {
            continue;
        }

        if (map[y][x] !== null) {
            continue;
        }

        map[y][x] = {
            sector: src.sector,
            symbol: sym,
            type: src.type,
            border: false
        };

        if (sym === "│") {
            fill.push([x, y - 1, sym, src]);
            fill.push([x, y + 1, sym, src]);
        }
        else if (sym === "─") {
            fill.push([x - 1, y, sym, src]);
            fill.push([x + 1, y, sym, src]);
        }
    }

    let view = new DocumentFragment();

    for (let y=0; y<map.length; ++y) {
        for (let x=0; x<map[y].length; ++x) {
            let room = map[y][x];

            if (room === null) {
                view.appendChild(document.createTextNode(" "));
                continue;
            }

            let span = document.createElement("span");
            span.appendChild(document.createTextNode(" "));
            span.classList.add("amc-room-"+room.sector);
            span.setAttribute("data-symbol", room.symbol);

            if (room.type !== null) {
                span.classList.add("amc-room-"+room.type);
            }

            if (room.border === true) {
                span.classList.add("amc-room-border");
            }

            view.appendChild(span);
        }

        view.appendChild(document.createTextNode("\n"));
    }

    mainview.appendChild(view);

    return mainview;
}

function amc_tui_create_login_form() {
    var form = document.createElement("form");
    var table = document.createElement("table");

    var form_cell_width = 20;
    var form_cols = 2;
    var form_rows = 3;
    var cols = form_cols + 1 + form_cols * form_cell_width;
    var rows = 2 * form_rows + 1;

    var fields = [];

    for (var y=0; y<rows; ++y) {
        var row = document.createElement("tr");

        for (var x=0; x<cols; ++x) {
            var text = null;
            var cell = null;

            if (y % 2 === 1) {
                if (x % (form_cell_width + 1) === 1) {
                    cell = document.createElement("td");
                    cell.setAttribute("colspan", form_cell_width);
                    fields.push(cell);
                }
                else if (x % (form_cell_width + 1) === 0 || x + 1 === cols) {
                    text = "│";
                }
            }
            else if (y === 0) {
                if (x === 0) {
                    text = "┌";
                }
                else if (x + 1 === cols) {
                    text = "┐";
                }
                else if (x % (form_cell_width + 1) === 0) {
                    text = "┬";
                }
                else text = "─";
            }
            else if (y + 1 === rows) {
                if (x === 0) {
                    text = "└";
                }
                else if (x + 1 === cols) {
                    text = "┘";
                }
                else if (x % (form_cell_width + 1) === 0) {
                    text = "┴";
                }
                else text = "─";
            }
            else if (y % 2 === 0) {
                if (x === 0) {
                    text = "├";
                }
                else if (x + 1 === cols) {
                    text = "┤";
                }
                else if (x % (form_cell_width + 1) === 0) {
                    text = "┼";
                }
                else text = "─";
            }
            else text = "─";

            if (text !== null) {
                var pre = document.createElement("pre");
                pre.append(document.createTextNode(text));

                if (cell === null) {
                    cell = document.createElement("td");
                }

                cell.append(pre);
            }

            if (cell !== null) {
                row.append(cell);
            }
        }

        table.append(row);
    }

    table.classList.add("amc-tui");
    form.append(table);

    form.setAttribute("method", "post");
    form.setAttribute("target", "hidden-iframe");
    form.setAttribute("action", "");
    form.setAttribute("autocomplete", "on");
    form.setAttribute("name", "loginform");
    form.id = "amc-login-form";

    var input_username = document.createElement("input");
    var input_password = document.createElement("input");
    var button_submit = document.createElement("input");

    input_username.setAttribute("type", "text");
    input_username.setAttribute("name", "username");
    input_username.setAttribute("required", "");
    input_username.setAttribute("autocomplete", "on");
    input_username.setAttribute("placeholder", "enter name here");
    input_username.setAttribute("autofocus", "");
    input_username.id = "amc-login-input-username";

    if (global.mud.state === "login-wrong-password") {
        input_username.setAttribute("disabled", "");
        input_username.value = global.mud.account.username;
    }

    input_password.setAttribute("type", "password");
    input_password.setAttribute("name", "password");
    input_password.setAttribute("required", "");
    input_password.setAttribute("autocomplete", "on");
    input_password.setAttribute("placeholder", "enter password here");
    input_password.id = "amc-login-input-password";

    button_submit.setAttribute("type",  "submit");
    button_submit.setAttribute("value", "LOGIN");
    button_submit.id = "amc-login-input-submit";

    form.addEventListener(
        'submit', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.target.submitted) {
                return;
            }

            if (global.mud.state !== "login"
            &&  global.mud.state !== "login-wrong-password") {
                return;
            }

            e.target.submitted = true;

            setTimeout(function(target){
                global.mud.account.username = document.getElementById(
                    "amc-login-input-username"
                ).value;

                global.mud.account.password = document.getElementById(
                    "amc-login-input-password"
                ).value;

                if (global.mud.state === "login") {
                    global.mud.state = "login-sending-username";
                    amc_send_command(global.mud.account.username);
                }
                else if (global.mud.state === "login-wrong-password") {
                    global.mud.state = "login-sending-password";
                    amc_send_command(global.mud.account.password);
                }

                target.parentNode.removeChild(target);
                history.replaceState(history.state, 'Login');
            }, 1, e.target);
        }, false
    );

    for (var i=0; i<fields.length; ++i) {
        fields[i].id = "amc-login-form-slot-"+i;
        fields[i].classList.add("amc-login-form-slot");

        switch (i) {
            case 0: {
                var label = document.createElement("label");
                label.setAttribute("for", "amc-login-input-username");
                label.appendChild(document.createElement("pre")).append(
                    document.createTextNode("Account:")
                );

                fields[i].appendChild(label);

                break;
            }
            case 2: {
                var label = document.createElement("label");
                label.setAttribute("for", "amc-login-input-password");
                label.appendChild(document.createElement("pre")).append(
                    document.createTextNode("Password:")
                );

                fields[i].appendChild(label);

                break;
            }
            case 1: fields[i].append(input_username); break;
            case 3: fields[i].append(input_password); break;
            case 5: fields[i].append(button_submit); break;
            default: break;
        }
    }

    return form;
}

function amc_tui_create_statview() {
    var table = document.createElement("table");

    table.classList.add("amc-tui");

    var cols = 36;
    var rows = 14;

    for (var y=0; y<rows; ++y) {
        var row = document.createElement("tr");

        for (var x=0; x<cols; ++x) {
            var text = " ";
            var cell = null;

            if (y === 0) {
                cell = document.createElement("td");
                cell.classList.add("amc-statview-title");
            }
            else if (y === 1) {
                cell = document.createElement("td");
                cell.classList.add("amc-statview-title-underline");
            }
            else if (y === 3) {
                if (x >= 1 && x < 8) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-label-health");
                }
                else if (x >= 8 && x < 13) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-health");
                }
                else if (x === 13) {
                    text = "/";
                }
                else if (x >= 14 && x < 19) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-health-max");
                }
                else if (x >= 20 && x < 35) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-health-bar");
                }
            }
            else if (y === 4) {
                if (x >= 1 && x < 8) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-label-energy");
                }
                else if (x >= 8 && x < 13) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-energy");
                }
                else if (x === 13) {
                    text = "/";
                }
                else if (x >= 14 && x < 19) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-energy-max");
                }
                else if (x >= 20 && x < 35) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-energy-bar");
                }
            }
            else if (y === 6) {
                if (x >= 1 && x < 13) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-label-ac");
                }
                else if (x >= 14 && x < 18) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-ac");
                }
                else if (x >= 20 && x < 24) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-label-str");
                }
                else if (x >= 25 && x < 29) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-str");
                }
                else if (x === 30) {
                    text = "/";
                }
                else if (x >= 32 && x < 35) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-str-base");
                }
            }
            else if (y === 7) {
                if (x >= 1 && x < 13) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-label-hitroll");
                }
                else if (x >= 14 && x < 18) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-hitroll");
                }
                else if (x >= 20 && x < 24) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-label-dex");
                }
                else if (x >= 25 && x < 29) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-dex");
                }
                else if (x === 30) {
                    text = "/";
                }
                else if (x >= 32 && x < 35) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-dex-base");
                }
            }
            else if (y === 8) {
                if (x >= 1 && x < 13) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-label-damroll");
                }
                else if (x >= 14 && x < 18) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-damroll");
                }
                else if (x >= 20 && x < 24) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-label-int");
                }
                else if (x >= 25 && x < 29) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-int");
                }
                else if (x === 30) {
                    text = "/";
                }
                else if (x >= 32 && x < 35) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-int-base");
                }
            }
            else if (y === 9) {
                if (x >= 20 && x < 24) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-label-wis");
                }
                else if (x >= 25 && x < 29) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-wis");
                }
                else if (x === 30) {
                    text = "/";
                }
                else if (x >= 32 && x < 35) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-wis-base");
                }
            }
            else if (y === 10) {
                if (x >= 1 && x < 13) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-label-affected");
                }
                else if (x >= 14 && x < 18) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-affected");
                }
                else if (x >= 20 && x < 24) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-label-con");
                }
                else if (x >= 25 && x < 29) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-con");
                }
                else if (x === 30) {
                    text = "/";
                }
                else if (x >= 32 && x < 35) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-con-base");
                }
            }
            else if (y === 11) {
                if (x >= 1 && x < 19) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-affected");
                }
            }
            else if (y === 13) {
                if (x >= 1 && x < 19) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-label-xp");
                }
                else if (x >= 20 && x < 35) {
                    cell = document.createElement("td");
                    cell.classList.add("amc-statview-xp-bar");
                }
            }

            if (text !== null) {
                var pre = document.createElement("pre");
                pre.append(document.createTextNode(text));

                if (cell === null) {
                    cell = document.createElement("td");
                }

                cell.append(pre);
            }

            if (cell !== null) {
                row.append(cell);
            }
        }

        table.append(row);
    }

    return table;
}

function amc_tui_get_secondary_top_placeholder() {
    var placeholder =
    "n∩n∩n∩n∩.ⁿ.ⁿ.ⁿ.ⁿ \"⌠ \"⌠\"⌠\"⌠⌂ ⌂⌂ ⌂⌂ ⌂ \n"+
    " n∩n∩n∩.ⁿ.ⁿΠ╷.ⁿ.ⁿ ↑↨ \"⌠\"⌠ ⌂⌂⌂ ⌂⌂ ⌂ ⌂\n"+
    ".ⁿn∩n∩.ⁿ.ⁿ.ⁿ│.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ\"⌠⌂ ⌂⌂ ⌂ ⌂ \n"+
    ".ⁿ.ⁿn∩.ⁿ ╶──┼──╴.ⁿ.ⁿ↑↨.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ\n"+
    ".ⁿ n∩.ⁿ↑↨.ⁿ │.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ~~.ⁿ~↑↨.ⁿ\n"+
    "n∩n∩n∩n∩n∩.ⁿ│.ⁿ.ⁿ.ⁿ┌───┐.ⁿ~~~~~~~~~ \n"+
    " n∩n∩n↑↨∩n∩ └────┬─┘.ⁿ └───╴.ⁿ ~~~.ⁿ\n"+
    ".ⁿ.ⁿ.ⁿn∩n∩n∩.ⁿ ┌─┴─┐.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ\n"+
    " ↑↨.ⁿ.ⁿ n∩.ⁿ.ⁿ │.ⁿ │.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ↑↨.ⁿ.ⁿ\n"+
    "↑↨ ↑↨.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ│.ⁿ └───╴.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ\n"+
    " ↑↨♣ ♣ ♣ ♠♣↑↨.ⁿ│ ↑↨♣ ♣.ⁿ.ⁿ.ⁿ.ⁿ.ⁿ↑↨.ⁿ\n"+
    "♠♣ ♠♣↑↨♠♣♠♣♣ ♣ │♠♣♣ ♣ ♠♣♠♣ ↑↨↑↨.ⁿ.ⁿ \n"+
    "♣↑↨ ♣ ♠♣ ↑↨.ⁿ♣ │♠♣ ♣ ♣ ♠♣♠♣ ♣↑↨.ⁿ.ⁿ \n"+
    "♣ ♣↑↨♠♣♠♣ ┌────┘♠♣♠♣↑↨ ♠♣♣ ♣ ♣ ♣.ⁿ.ⁿ\n"+
    "♣ ♠♣♠♣♠♣.ⁿ│♠♣♠♣♠♣♠♣♣ ♠♣ ♠♣ ♣ ♣ ♠♣.ⁿ ";

    return placeholder;
}

function amc_tui_get_equipment_placeholder() {
    return (
        "Equipment:\n"+
        "\n"+
        "a gold ring\n"+
        "a gold ring\n"+
        "an amulet of Holy Magic\n"+
        "an amulet of Holy Magic\n"+
        "a headband with bright jewel\n"+
        "a pair of green leggings\n"+
        "a pair of green gloves\n"+
        "a pair of green sleeves\n"+
        "a green coat\n"+
        "a green belt\n"+
        "a small runed wand\n"+
        "a crystal gem\n"+
        "a silver bracer\n"+
        "a silver bracer\n"+
        "a small silver shield\n"+
        "an elven longsword\n"
    );
}

function amc_tui_get_inventory_placeholder() {
    return (
        "Inventory:\n"+
        "\n"+
        "(3) a yellow potion\n"+
        "a beaverskin bracer\n"+
        "a runed elven scroll\n"
    );
}

function amc_tui_get_roomview_placeholder() {
    return (
        "A small clearing\n"+
        "  You are in a small clearing in the shadow grove. There is\n"+
        "charred grass underfoot, and the signs of fire here and\n"+
        "there. It is almost as if the plant life shuns this spot.\n"+
        "The shadowy mist hovers all around, obscuring your view into\n"+
        "the grove.\n"+
        "  A small path leads east to some shadowy structure. All\n"+
        "other exits are shrouded in shadowy mist.\n"+
        "\n"+
        " [Exits: north east west]\n"+
        "A shadow guardian screams a challenge and attacks.\n"+
        "A shadow guardian screams a challenge and attacks.\n"+
        "An emaciated adventurer is here looking lost and hopeless.\n"
    );
}
