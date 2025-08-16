"use strict";

function main() {
    global.title = document.title;

    var metas = document.getElementsByTagName("META");

    for (var i=0; i < metas.length; ++i) {
        if (metas[i].name === "amc-server") {
            global.server.host = metas[i].getAttribute('data-host');
            global.server.port = metas[i].getAttribute('data-port');
        }
    }

    if (typeof COMPILE_TIME === 'undefined' || COMPILE_TIME == null) {
        global.homedir = "../";
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

    window.addEventListener(
        'popstate', function(event) {
            amc_interpret_hashtag();
        }, false
    );

    document.fonts.ready.then(
        function (font_face_set) {
            document.getElementById("amc-greet").classList.add("disappear");

            setTimeout(function() {
                document.getElementById("amc").classList.add("amc-main-font");
                amc_init();
            }, 250); // Let's wait for #amc-greet to disappear completely.
        }
    );

    for (var i=0; i< global.font.faces.length; ++i) {
        var face = global.font.faces[i];

        var font_face = new FontFace(
            face.family,
            'url('+global.homedir+global.font.directory+'/'+face.fname+')'
        );

        document.fonts.add(font_face);
        font_face.load();
    }
}

function amc_interval() {
    let now = Date.now();

    if (now - global.last_interval >= 1000) {
        global.last_interval = now;
        amc_main_loop();
    }
}

function amc_update_scroll() {
    let was_bottom = global.mud.log.scrolled.bottom;
    let was_top = global.mud.log.scrolled.top;
    let is_bottom = amc_scrolled_bottom();
    let is_top = amc_scrolled_top();

    global.mud.log.scrolled.bottom = is_bottom;
    global.mud.log.scrolled.top = is_top;

    if (!was_bottom && is_bottom) {
        amc_update_terminal();
    }

    if (!was_top && is_top) {
        amc_load_history();
    }
}

function amc_main_loop() {
    var focus = !document.hidden;

    if (global.alert) {
        play_sound("sfx-alert");
        global.alert = false;
    }

    if (global.title !== document.title) {
        document.title = global.title;
    }

    var amc = document.getElementById("amc");

    if (amc.getAttribute("data-mudstate") !== amc_get_mud_state()) {
        amc.setAttribute("data-mudstate", amc_get_mud_state());

        amc_show_mudstate(amc_get_mud_state());
    }

    let blinking_elements = document.getElementsByClassName("ans-blinking");

    for (let i=0; i<blinking_elements.length; ++i) {
        let el = blinking_elements[i];

        if (el.classList.contains("ans-blinked")) {
            el.classList.remove("ans-blinked");
        }
        else {
            el.classList.add("ans-blinked");
        }
    }

    amc_update_scroll();
}

function amc_init() {
    document.getElementById("amc-greet").classList.add(
        "amc-hidden-tab"
    );

    amc_create_chatview();
    amc_create_terminal();
    amc_create_inputbar();

    amc_init_panel(amc_calc_panel_width(), amc_calc_panel_height());

    var main = document.getElementById("amc-main");

    main.onclick = function() {
        amc_click_background();
    };

    window.addEventListener(
        'resize', function () {
            amc_init_panel(amc_calc_panel_width(), amc_calc_panel_height());
        }
    );

    main.classList.remove("amc-hidden-tab");

    setTimeout(
        function() {
            var m = document.getElementById("amc-main");

            m.classList.add("fade-in");
            m.classList.remove("fade-out");

            if (document.getElementById("amc-terminal") !== null) {
                setTimeout(
                    function() {
                        setInterval(
                            function() {
                                // Let's start the main loop.
                                amc_interval();
                            }, 250
                        );

                        amc_connect();
                    }, 0
                );
            }
        }, 250
    );
}

function amc_connect() {
    var servers = [
        "wss://aronia.ee:4004",
        "ws://localhost:4004"
    ];

    var server = servers[0];

    if (typeof COMPILE_TIME === 'undefined' || COMPILE_TIME == null) {
        server = servers[1];
    }

    global.ws = new WebSocket(server);
    global.mud.log.text.utf8.decoder = new TextDecoder();

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
        amc_print("\n#Disconnected.\n");

        msdp_deinit();
        telnet_deinit();

        setTimeout(
            function() {
                amc_print("#Reconnecting...\n");
                amc_set_mud_state("");
                amc_connect();
            }, 3000
        );
    };

    global.ws.onerror = function(err) {
        amc_print("\n#Error: "+err.message+"\n");
        global.ws.close();
    };
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

function amc_send_bytes(array) {
    global.ws.send(new Uint8Array(array).buffer);
}

function amc_send_command(line) {
    let encoder = new TextEncoder();

    global.ws.send(encoder.encode(line+"\n").buffer);
}
