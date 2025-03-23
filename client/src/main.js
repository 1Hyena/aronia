"use strict";

var global = {
    sfx : null,
    server : {
        host : null,
        port : null
    },
    ws : null,
    xt : {
        terminal : null,
        fitter : null
    },
    title : "",
    alert : true,
    mud : {
        incoming : {
            data : [],
            info : []
        }
    },
    log : {
        data : []
    }
};

function main() {
    global.title = document.title;

    var metas = document.getElementsByTagName("META");

    for (var i=0; i < metas.length; ++i) {
        if (metas[i].name === "amc-server") {
            global.server.host = metas[i].getAttribute('data-host');
            global.server.port = metas[i].getAttribute('data-port');
        }
    }

    (
        function() {
            var link = (
                document.querySelector("link[rel*='icon']") ||
                document.createElement('link')
            );

            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = document.getElementById("gfx-favicon").src;

            document.getElementsByTagName('head')[0].appendChild(link);
        }
    )();

    global.sfx = init_sound();

    var greet = document.getElementById("amc-greet");
    greet.classList.add("disappear");

    window.addEventListener(
        'popstate', function(event) {
            amc_interpret_hashtag();
        }, false
    );

    document.fonts.ready.then(
        function (font_face_set) {
            setTimeout(function() {
                amc_init_panel();
            }, 250); // Let's wait for #amc-greet to disappear completely.
        }
    );
}

function amc_main_loop() {
    setTimeout(
        function() {
            amc_main_loop();
        },
        1000
    );

    var focus = !document.hidden;

    if (global.alert) {
        play_sound("sfx-alert");
        global.alert = false;
    }

    if (global.title !== document.title) {
        document.title = global.title;
    }
}

function amc_init_panel() {
    var frag_secondary = new DocumentFragment();
    var frag_primary = new DocumentFragment();
    var frag_tertiary = new DocumentFragment();

    frag_secondary.append(amc_create_secondary_panel());
    frag_primary.append(amc_create_primary_panel());
    frag_tertiary.append(amc_create_tertiary_panel());

    document.getElementById("amc-panel-secondary").append(frag_secondary);
    document.getElementById("amc-panel-primary").append(frag_primary);
    document.getElementById("amc-panel-tertiary").append(frag_tertiary);

    amc_init_terminal(document.getElementById("amc-primary-bottom"));
    amc_init_mainview(document.getElementById("amc-primary-top"));
    amc_init_zoneview(document.getElementById("amc-secondary-top"));
    amc_init_statview(document.getElementById("amc-secondary-bottom"));

    document.getElementById("amc-greet").classList.add("amc-hidden-tab");

    var main = document.getElementById("amc-main");

    main.onclick = function() {
        amc_click_background();
    };

    main.classList.remove("amc-hidden-tab");

    setTimeout(
        function() {
            var m = document.getElementById("amc-main");

            m.classList.add("fade-in");
            m.classList.remove("fade-out");

            if (document.getElementById("amc-terminal") !== null) {
                global.xt.fitter.fit();

                setTimeout(
                    function() {
                        amc_main_loop(); // Let's start the main loop.
                        amc_connect();
                    }, 0
                );
            }
        }, 250
    );
}

function amc_create_secondary_panel() {
    var panel = document.createElement("div");
    var table = document.createElement("table");

    table.classList.add("amc-tui");

    var cols = 38;
    var rows = 32;

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
                if (y + 1 === Math.floor(rows / 2)) {
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
            else if (y + 1 === Math.floor(rows / 2)) {
                text = "═";
            }
            else {
                if (x === 1 && y === 1) {
                    cell = document.createElement("td");
                    cell.setAttribute("colspan", cols - 2);
                    cell.setAttribute("rowspan", Math.floor((rows - 3) / 2));
                    cell.id = "amc-secondary-top";
                }
                else if (x === 1 && y === Math.floor(rows / 2)) {
                    cell = document.createElement("td");
                    cell.setAttribute("colspan", cols - 2);
                    cell.setAttribute(
                        "rowspan", (rows - 3) - Math.floor((rows - 3) / 2)
                    );
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

function amc_create_primary_panel() {
    var panel = document.createElement("div");
    var table = document.createElement("table");

    table.classList.add("amc-tui");

    var cols = 82;
    var rows = 32;

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
                if (y + 1 === Math.floor(rows / 2)) {
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
            else if (y + 1 === Math.floor(rows / 2)) {
                text = "═";
            }
            else {
                if (x === 1 && y === 1) {
                    cell = document.createElement("td");
                    cell.setAttribute("colspan", cols - 2);
                    cell.setAttribute("rowspan", Math.floor((rows - 3) / 2));
                    cell.id = "amc-primary-top";
                }
                else if (x === 1 && y === Math.floor(rows / 2)) {
                    cell = document.createElement("td");
                    cell.setAttribute("colspan", cols - 2);
                    cell.setAttribute(
                        "rowspan", (rows - 3) - Math.floor((rows - 3) / 2)
                    );
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

function amc_create_tertiary_panel() {
    var panel = document.createElement("div");
    return panel;
}

function amc_init_mainview(container) {
    var wrapper = document.createElement("div");

    wrapper.id = "amc-mainview-wrapper";

    var placeholder = document.createElement("pre");

    placeholder.appendChild(
        document.createTextNode(get_primary_top_placeholder())
    );

    wrapper.appendChild(placeholder);

    container.appendChild(wrapper);
}

function amc_init_zoneview(container) {
    var wrapper = document.createElement("div");

    wrapper.id = "amc-zoneview-wrapper";

    var placeholder = document.createElement("pre");

    placeholder.appendChild(
        document.createTextNode(get_secondary_top_placeholder())
    );

    wrapper.appendChild(placeholder);

    container.appendChild(wrapper);
}

function amc_init_statview(container) {
    var wrapper = document.createElement("div");

    wrapper.id = "amc-statview-wrapper";

    var placeholder = document.createElement("pre");

    placeholder.appendChild(
        document.createTextNode(get_secondary_bottom_placeholder())
    );

    wrapper.appendChild(placeholder);

    container.appendChild(wrapper);
}

function amc_init_terminal(container) {
    var terminal_wrapper = document.createElement("div");
    var terminal = document.createElement("div");

    terminal_wrapper.id = "amc-terminal-wrapper";
    terminal.id = "amc-terminal";

    terminal_wrapper.appendChild(terminal);
    container.appendChild(terminal_wrapper);

    global.xt.terminal = new Terminal(
        {
            theme: {
                background: "#00000000",
                cursor: "#FFFFFF40"
            },
            allowTransparency: true
        }
    );

    global.xt.fitter = new FitAddon.FitAddon();
    global.xt.terminal.loadAddon(global.xt.fitter);
    global.xt.terminal.open(terminal);

    window.addEventListener(
        'resize', function () {
            global.xt.fitter.fit();
        }
    );

    global.xt.terminal.onKey(
        e => {
            if (e.domEvent.key == "Backspace") {
                global.ws.send(str2buf("\b"));
                global.xt.terminal.write("\b \b");
            }
            else if (e.key == '\r') {
                global.xt.terminal.write('\n\r');
                global.ws.send(str2buf("\n"));
            }
            else {
                global.ws.send(str2buf(e.key));
                global.xt.terminal.write(e.key);
            }
        }
    );
}

function amc_connect() {
    global.ws = new WebSocket("wss://aronia.ee:4004");

    global.ws.onmessage = function (evt) {
        var received_msg = evt.data;
        var reader = new FileReader();

        reader.onload = function() {
            global.mud.incoming.data.push(
                ...Array.from(new Uint8Array(reader.result))
            );

            amc_read_incoming();
        }

        reader.readAsArrayBuffer(evt.data);
    };

    global.ws.onclose = function() {
        global.xt.terminal.write("\n\r#Disconnected.\n\r");

        setTimeout(
            function() {
                global.xt.terminal.write("#Reconnecting...\n\r");
                amc_connect();
            }, 3000
        );
    };

    global.ws.onerror = function(err) {
        global.xt.terminal.write("\n\r#Error: "+err.message+"\n\r");
        global.ws.close();
    };
}

function amc_read_incoming() {
    receive_from_incoming(global.mud.incoming);

    for (var i=0, sz = global.mud.incoming.info.length; i<sz; ++i) {
        switch (global.mud.incoming.info[i].type) {
            case "log": {
                global.log.data.push(...global.mud.incoming.info[i].data);

                break;
            }
            default: continue;
        }
    }

    global.mud.incoming.info = [];

    if (global.log.data.length > 0) {
        amc_write_log();
    }
}

function amc_write_line(data, start, length) {
    var buffer = [];

    for (var i=0; i<length; ++i) {
        buffer.push(data[start+i]);
    }

    if (buffer.length === 0) {
        return;
    }

    global.xt.terminal.write(new Uint8Array(buffer));

    for (;;) {
        var char = buffer.pop();

        if (char !== 10 && char !== 13) {
            buffer.push(char);
            break;
        }
    }

    var line = String.fromCharCode(...buffer);

    var regex = new RegExp(
        "(^(?:.* > )?.+ (?:tells you|tell .+|tells the group|tell the group) ')"
        +"(.+)(['][.]?.*$)"
    );

    var arr = regex.exec(line) || [];

    if (arr.length === 4) {
        global.alert = true;
    }

    regex = new RegExp(
        "(^.*\\x1B\\[8m\\x1B\\]0;)(.+)(\\x07\\x1B\\[28m\\x1B\\[0m.*$)"
    );

    arr = regex.exec(line) || [];

    if (arr.length === 4) {
        global.title = arr[2];
    }
}

function amc_write_prompt() {
    // TODO: start sending prompt marker from the MUD server

    var length = global.log.data.length;

    if (length >= 2
    && global.log.data[length - 2] === '>'.charCodeAt()
    && global.log.data[length - 1] === ' '.charCodeAt()) {
        global.xt.terminal.write(global.log.data);
        global.log.data = [];
    }
}

function amc_write_log() {
    var written = 0;

    for (var i=0, sz = global.log.data.length; i<sz; ++i) {
        if (global.log.data[i] === 10) {
            var length = (i + 1) - written;

            if (i + 1 < sz && global.log.data[i + 1] === 13) {
                length++;
                i++;
            }

            amc_write_line(global.log.data, written, length);

            written += length;
        }
    }

    if (written > 0) {
        global.log.data = global.log.data.slice(written);
    }

    amc_write_prompt();
}

function amc_click_background() {
}

function amc_interpret_hashtag() {
    var tags = location.hash.substring(1).split("#");

    for (var i=0, sz=hashes.length; i<sz; ++i) {
        var tag = decodeURIComponent(tags[i]);

        if (hash.length > 0) {
            console.log("hashtag: "+tag);
        }
    }
}

function get_primary_top_placeholder() {
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

function get_secondary_top_placeholder() {
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


function get_secondary_bottom_placeholder() {
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
