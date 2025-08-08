"use strict";

function amc_show_login(container) {
    let container_w = parseInt(container.getAttribute("colspan"), 10);
    let container_h = parseInt(container.getAttribute("rowspan"), 10);

    let centered = amc_tui_create_centered(
        amc_tui_create_login_form(), container_w, container_h
    );

    centered.classList.add("amc-tui-fg");

    container.replaceChildren(centered);
}

function amc_show_console(container) {
    amc_deinit_terminal();
    amc_init_terminal(container);
    scroll_to_bottom("amc-terminal-wrapper");
}

function amc_show_message(container, message) {
    amc_init_noteview(container, document.createTextNode(message));
}

function amc_get_mud_state() {
    return global.mud.state;
}

function amc_set_mud_state(state) {
    global.mud.state = state;
}

function amc_show_mudstate(state) {
    var container = document.getElementById("amc-panel-fg-bottom");

    if (container === null) {
        return;
    }

    amc_set_mud_state(state);

    switch (state) {
        case "login-wrong-password":
        case "login" : {
            amc_show_login(container);

            break;
        }
        case "account-menu": {
            //amc_show_message(container, "Account menu");
            scroll_to_bottom("amc-terminal-wrapper");
            break;
        }
        case "login-manual": {
            amc_show_message(container, "Please use the console to sign in.");
            break;
        }
        case "in-game": {
            amc_init_mainview(
                document.getElementById("amc-panel-below-top-left-1st")
            );

            break;
        }
        default: break;
    }
}
