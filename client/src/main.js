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
        },
        state : "",
        account : {
            username : "",
            password : ""
        },
        log : {
            data : [],
            time : 0
        }
    },
    offscreen : {
        terminal : null,
        chatview : null
    },
    buggy : {}
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

    document.getElementById("amc-greet").classList.add("disappear");

    window.addEventListener(
        'popstate', function(event) {
            amc_interpret_hashtag();
        }, false
    );

    document.fonts.ready.then(
        function (font_face_set) {
            setTimeout(function() {
                amc_init();
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

    var amc = document.getElementById("amc");

    if (amc.getAttribute("data-mudstate") !== global.mud.state) {
        amc.setAttribute("data-mudstate", global.mud.state);

        amc_show_mudstate(global.mud.state);
    }
}

function amc_init() {
    document.getElementById("amc-greet").classList.add(
        "amc-hidden-tab"
    );

    amc_create_chatview();
    amc_create_terminal();

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
                global.mud.state = "";
                amc_connect();
            }, 3000
        );
    };

    global.ws.onerror = function(err) {
        global.xt.terminal.write("\n\r#Error: "+err.message+"\n\r");
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
