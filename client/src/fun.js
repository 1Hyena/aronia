"use strict";

function amc_show_login(container) {
    container.replaceChildren(amc_tui_create_login_form());
}

function amc_show_message(container, message) {
    amc_init_noteview(container, document.createTextNode(message));
}

function amc_show_mudstate(state) {
    var container = document.getElementById("amc-panel-fg");

    global.mud.state = state;

    switch (state) {
        case "login-wrong-password":
        case "login" : {
            amc_show_login(container);
            break;
        }
        case "account-menu": {
            amc_show_message(container, "Account menu");
            break;
        }
        case "login-manual": {
            amc_show_message(container, "Please use the console to sign in.");
            break;
        }
        case "in-game": {
            amc_init_mainview(container);
            break;
        }
        default: break;
    }
}
