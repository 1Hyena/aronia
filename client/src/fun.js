"use strict";

function amc_show_login(container) {
    container.replaceChildren(amc_create_login_form());
}

function amc_show_message(container, message) {
    var pre = document.createElement("pre");
    pre.appendChild(document.createTextNode(message));
    container.replaceChildren(pre);
}

function amc_show_mudstate(state) {
    var container = document.getElementById("amc-primary-top");

    switch (state) {
        case "login-wrong-password":
        case "login" : {
            amc_show_login(container);
            break;
        }
        case "account-menu": {
            amc_show_message(container, "");
            break;
        }
        case "login-manual": {
            amc_show_message(container, "Please use the console to sign in.");
            break;
        }
        case "": {
            amc_init_mainview(container);
            break;
        }
        default: break;
    }
}
