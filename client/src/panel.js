"use strict";

function amc_calc_panel_width() {
    var w = document.getElementById('amc-body').clientWidth;
    var h = document.getElementById('amc-body').clientHeight;
    var p = Math.min(w, h) / 100;
    return Math.floor(0.8 * w / p);
}

function amc_calc_panel_height() {
    var w = document.getElementById('amc-body').clientWidth;
    var h = document.getElementById('amc-body').clientHeight;
    var p = Math.min(w, h) / 100;
    return Math.floor(0.4 * h / p);
}

function amc_init_panel(width, height) {
    var min_primary_w = 83;
    var min_secondary_w = 38;
    var min_tertiary_w = 19;

    if (global.offscreen.terminal === null) {
        var view = document.getElementById("amc-terminal");

        if (view !== null) {
            view.parentNode.removeChild(view);
            global.offscreen.terminal = view;
        }
    }

    if (global.offscreen.chatview === null) {
        var view = document.getElementById("amc-chatview");

        if (view !== null) {
            view.parentNode.removeChild(view);
            global.offscreen.chatview = view;
        }
    }

    var frag_secondary = new DocumentFragment();
    var frag_primary = new DocumentFragment();
    var frag_tertiary = new DocumentFragment();

    width  = Math.max(width,  80 + 2);
    height = Math.max(height, 24 + 2);

    if (width < min_primary_w + min_secondary_w) {
        frag_primary.append(amc_create_primary_panel(width, height));
    }
    else if (width < min_primary_w + min_secondary_w + min_tertiary_w) {
        frag_secondary.append(
            amc_create_secondary_panel(min_secondary_w, height)
        );

        frag_primary.append(
            amc_create_primary_panel(width - min_secondary_w, height)
        );
    }
    else {
        var excess_w = width - (
            min_secondary_w + min_primary_w + min_tertiary_w
        );

        frag_secondary.append(
            amc_create_secondary_panel(min_secondary_w, height)
        );

        var primary_w = min_primary_w + Math.floor(excess_w / 2);

        frag_primary.append(amc_create_primary_panel(primary_w, height));

        frag_tertiary.append(
            amc_create_tertiary_panel(
                width - (min_secondary_w + primary_w), height
            )
        );
    }

    document.getElementById("amc-panel-secondary").replaceChildren(
        frag_secondary
    );

    document.getElementById("amc-panel-primary").replaceChildren(
        frag_primary
    );

    document.getElementById("amc-panel-tertiary").replaceChildren(
        frag_tertiary
    );

    var primary_bottom = document.getElementById("amc-primary-bottom");

    if (primary_bottom !== null && global.offscreen.terminal !== null) {
        var wrapper = document.createElement("div");
        wrapper.id = global.offscreen.terminal.id+"-wrapper";
        wrapper.append(global.offscreen.terminal);
        primary_bottom.append(wrapper);
        global.offscreen.terminal = null;
    }

    var tertiary_top = document.getElementById("amc-tertiary-top");

    if (tertiary_top !== null && global.offscreen.chatview !== null) {
        var wrapper = document.createElement("div");
        wrapper.id = global.offscreen.chatview.id+"-wrapper";
        wrapper.append(global.offscreen.chatview);
        tertiary_top.append(wrapper);
        global.offscreen.chatview = null;
    }

    amc_init_mainview(document.getElementById("amc-primary-top"));
    amc_init_zoneview(document.getElementById("amc-secondary-top"));
    amc_init_statview(document.getElementById("amc-secondary-bottom"));
}
