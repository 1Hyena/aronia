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

function amc_tui_update_character_title() {
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

function amc_tui_update_health_bar() {
    let classname = "amc-statview-health-bar";
    let cells = document.getElementsByClassName(classname).length;
    let health = msdp.variables.HEALTH && msdp.variables.HEALTH_MAX > 0 ? (
        parseInt(msdp.variables.HEALTH) / parseInt(msdp.variables.HEALTH_MAX)
    ) : 0;
    let left = Math.max(Math.min(Math.floor(health * cells), cells), 0);
    let bar = "▒".repeat(left)+"░".repeat(cells - left);

    amc_text_to_tui_class(classname, bar);
}

function amc_tui_update_energy_bar() {
    let classname = "amc-statview-energy-bar";
    let cells = document.getElementsByClassName(classname).length;
    let energy = msdp.variables.ENERGY && msdp.variables.ENERGY_MAX > 0 ? (
        parseInt(msdp.variables.ENERGY) / parseInt(msdp.variables.ENERGY_MAX)
    ) : 0;
    let left = Math.max(Math.min(Math.floor(energy * cells), cells), 0);
    let bar = "▒".repeat(left)+"░".repeat(cells - left);

    amc_text_to_tui_class(classname, bar);
}

function amc_tui_update_xp_bar() {
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

function amc_tui_update_xp() {
    amc_tui_update_xp_bar();

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

function amc_create_secondary_panel(width, height) {
    var panel = document.createElement("div");
    var table = document.createElement("table");

    table.classList.add("amc-tui");

    var cols = width;
    var rows = height;

    var upper_rows = Math.floor((rows - 3) / 2);
    var lower_rows = (rows - 3) - upper_rows;

    for (var y=0; y<rows; ++y) {
        var row = document.createElement("tr");

        for (var x=0; x<cols; ++x) {
            var text = null;
            var cell = null;

            if (y === 0) {
                if (x === 0) {
                    text = "╔";
                }
                else if (x + 1 === cols) {
                    text = "╗";
                }
                else {
                    text = "═";
                }
            }
            else if (y + 1 == rows) {
                if (x === 0) {
                    text = "╚";
                }
                else if (x + 1 === cols) {
                    text = "╝";
                }
                else {
                    text = "═";
                }
            }
            else if (x === 0 || x + 1 === cols) {
                if (y === upper_rows + 1) {
                    if (x === 0) {
                        text = "╠";
                    }
                    else {
                        text = "╣";
                    }
                }
                else {
                    text = "║";
                }
            }
            else if (y === upper_rows + 1) {
                text = "═";
            }
            else {
                if (x === 1 && y === 1) {
                    cell = document.createElement("td");
                    cell.setAttribute("colspan", cols - 2);
                    cell.setAttribute("rowspan", upper_rows);
                    cell.id = "amc-secondary-top";
                }
                else if (x === 1 && y === upper_rows + 2) {
                    cell = document.createElement("td");
                    cell.setAttribute("colspan", cols - 2);
                    cell.setAttribute("rowspan", lower_rows);
                    cell.id = "amc-secondary-bottom";
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

    panel.append(table);

    return panel;
}

function amc_create_primary_panel(width, height) {
    var panel = document.createElement("div");
    var table = document.createElement("table");

    table.classList.add("amc-tui");

    var cols = width;
    var rows = height;

    var upper_rows = Math.floor((rows - 3) / 2);
    var lower_rows = (rows - 3) - upper_rows;

    for (var y=0; y<rows; ++y) {
        var row = document.createElement("tr");

        for (var x=0; x<cols; ++x) {
            var text = null;
            var cell = null;

            if (y === 0) {
                if (x === 0) {
                    text = "╭";
                }
                else if (x + 1 === cols) {
                    text = "╮";
                }
                else {
                    text = "─";
                }
            }
            else if (y + 1 == rows) {
                if (x === 0) {
                    text = "╰";
                }
                else if (x + 1 === cols) {
                    text = "╯";
                }
                else {
                    text = "─";
                }
            }
            else if (x === 0 || x + 1 === cols) {
                if (y === upper_rows + 1) {
                    if (x === 0) {
                        text = "╞";
                    }
                    else {
                        text = "╡";
                    }
                }
                else {
                    text = "│";
                }
            }
            else if (y === upper_rows + 1) {
                text = "═";
            }
            else {
                if (x === 1 && y === 1) {
                    cell = document.createElement("td");
                    cell.setAttribute("colspan", cols - 2);
                    cell.setAttribute("rowspan", upper_rows);
                    cell.id = "amc-primary-top";
                }
                else if (x === 1 && y === upper_rows + 2) {
                    cell = document.createElement("td");
                    cell.setAttribute("colspan", cols - 2);
                    cell.setAttribute("rowspan", lower_rows);
                    cell.id = "amc-primary-bottom";
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

    panel.append(table);

    return panel;
}

function amc_create_login_form() {
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
                    global.ws.send(str2buf(global.mud.account.username+"\n"));
                }
                else if (global.mud.state === "login-wrong-password") {
                    global.mud.state = "login-sending-password";
                    global.ws.send(str2buf(global.mud.account.password+"\n"));
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

function amc_create_statview() {
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

function amc_create_tertiary_panel(width, height) {
    var panel = document.createElement("div");
    var table = document.createElement("table");

    table.classList.add("amc-tui");

    var cols = width;
    var rows = height;

    var upper_rows = Math.floor((rows - 3) / 2);
    var lower_rows = (rows - 3) - upper_rows;

    for (var y=0; y<rows; ++y) {
        var row = document.createElement("tr");

        for (var x=0; x<cols; ++x) {
            var text = null;
            var cell = null;

            if (y === 0) {
                if (x === 0) {
                    text = "╔";
                }
                else if (x + 1 === cols) {
                    text = "╗";
                }
                else {
                    text = "═";
                }
            }
            else if (y + 1 == rows) {
                if (x === 0) {
                    text = "╚";
                }
                else if (x + 1 === cols) {
                    text = "╝";
                }
                else {
                    text = "═";
                }
            }
            else if (x === 0 || x + 1 === cols) {
                if (y === upper_rows + 1) {
                    if (x === 0) {
                        text = "╠";
                    }
                    else {
                        text = "╣";
                    }
                }
                else {
                    text = "║";
                }
            }
            else if (y === upper_rows + 1) {
                text = "═";
            }
            else {
                if (x === 1 && y === 1) {
                    cell = document.createElement("td");
                    cell.setAttribute("colspan", cols - 2);
                    cell.setAttribute("rowspan", upper_rows);
                    cell.id = "amc-tertiary-top";
                }
                else if (x === 1 && y === upper_rows + 2) {
                    cell = document.createElement("td");
                    cell.setAttribute("colspan", cols - 2);
                    cell.setAttribute("rowspan", lower_rows);
                    cell.id = "amc-tertiary-bottom";
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

    panel.append(table);

    return panel;
}

function amc_get_primary_top_placeholder() {
    let placeholder =
    "╔══════════════════════╤══╗ A small clearing\n"+
    "║╭───╮     ╭───╮     ╭─┴─╮║   You are in a small clearing in the shadow g"+
    "rove.\n"+
    "╟┤   ├─────┤  ↑├─────┤   │║ There is charred grass underfoot, and the sig"+
    "ns of\n"+
    "║╰───╯     ╰─┬─╯     ╰───╯║ fire here and there. It is almost as if the p"+
    "lant\n"+
    "║      ╭─────┴─────╮      ║ life shuns this spot. The shadowy mist hovers"+
    " all\n"+
    "║      │           │      ║ around, obscuring your view into the grove.\n"+
    "║╭───╮ │           │ ╭─┬─╮║   A small path leads east to some shadowy str"+
    "ucture.\n"+
    "║│   ├─┤ c   @  k  ├─┼─┼─┤║ All other exits are shrouded in shadowy mist."+
    "\n"+
    "║╰─┬─╯ │      kk   │ ╰─┼─╯║\n"+
    "║  │   │           │   │  ║\n"+
    "║  │   ╰───────────╯   │  ║\n"+
    "║╭─┴─╮               ╭─┴─╮║\n"+
    "║│   │               │   │║\n"+
    "║╰─┬─╯               ╰─┬─╯║ [Exits: north east west]\n"+
    "╚══╧═══════════════════╧══╝\n"+
    "A shadow guardian screams a challenge and attacks.\n"+
    "A shadow guardian screams a challenge and attacks.\n"+
    "An emaciated adventurer is here looking lost and hopeless.\n";

    return placeholder;
}

function amc_get_secondary_top_placeholder() {
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

function amc_get_secondary_bottom_placeholder() {
    var placeholder =
    "     Courage the Dwarf Cleric       \n"+
    "    ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌      \n"+
    "                                    \n"+
    " Health: 350 / 350  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ \n"+
    " Energy:  50 / 250  ▒▒▒░░░░░░░░░░░░ \n"+
    "                                    \n"+
    " Armor Class:  150  STR:   18 / 18  \n"+
    " To Hit:       +20  DEX:   17 / 17  \n"+
    " To Damage:    +11  INT:   12 / 12  \n"+
    "                    WIS:   15 / 15  \n"+
    " Affected By:       CON:   22 / 22  \n"+
    " H|I|S              CHA:   13 / 14  \n"+
    "                                    \n"+
    " 254 Xp → Lvl 33:   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒░ ";

    return placeholder;
}
