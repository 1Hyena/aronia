"use strict";

function amc_init_mainview(container) {
    if (container === null) {
        return;
    }

    if (document.getElementById("amc-mainview-wrapper") !== null) {
        bug();
        return;
    }

    var wrapper = document.createElement("div");

    wrapper.id = "amc-mainview-wrapper";

    var placeholder = document.createElement("pre");

    placeholder.appendChild(
        document.createTextNode(amc_get_primary_top_placeholder())
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

    var placeholder = document.createElement("pre");

    placeholder.appendChild(
        document.createTextNode(amc_get_secondary_bottom_placeholder())
    );

    wrapper.appendChild(placeholder);

    container.appendChild(wrapper);
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

function amc_create_terminal() {
    if (document.getElementById("amc-terminal") !== null
    ||  global.offscreen.terminal !== null) {
        bug();
        return;
    }

    var terminal = document.createElement("div");

    terminal.id = "amc-terminal";

    global.offscreen.terminal = terminal;

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
