"use strict";

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
    var placeholder =
    "╔══════════════╤══╗ A small clearing\n"+
    "║╭───╮ ╭───╮ ╭─┴─╮║   You are in a small clearing in the shadow grove. "+
    "There is\n"+
    "╟┤   ├─┤   ├─┤   │║ charred grass underfoot, and the signs of fire here "+
    "and\n"+
    "║╰───╯ ╰─┬─╯ ╰───╯║ there. It is almost as if the plant life shuns this "+
    "spot.\n"+
    "║╭───╮ ╭─┴─╮ ╭─┬─╮║ The shadowy mist hovers all around, obscuring your "+
    "view into\n"+
    "║│   ├─┤ @ ├─┼─┼─┤║ the grove.\n"+
    "║╰─┬─╯ ╰───╯ ╰─┼─╯║   A small path leads east to some shadowy structure. "+
    "All\n"+
    "║╭─┴─╮       ╭─┴─╮║ other exits are shrouded in shadowy mist.\n"+
    "║│   │       │   │║\n"+
    "║╰─┬─╯       ╰─┬─╯║\n"+
    "╚══╧═══════════╧══╝\n"+
    " [Exits: north east west]\n"+
    "A shadow guardian screams a challenge and attacks.\n"+
    "A shadow guardian screams a challenge and attacks.\n"+
    "An emaciated adventurer is here looking lost and hopeless.\n"+
    "\n"+
    "8 Mana:Slow Move:Good >";

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
