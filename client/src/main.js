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
    alert : true
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
                global.xt.terminal.open(
                    document.getElementById('amc-terminal')
                );

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

                greet.classList.add("amc-hidden-tab");

                var main = document.getElementById("amc-main");

                main.onclick = function() {
                    amc_click_background();
                };

                main.classList.remove("amc-hidden-tab");

                setTimeout(function() {
                    main.classList.add("fade-in");
                    main.classList.remove("fade-out");
                    global.xt.fitter.fit();

                    setTimeout(function() {
                        amc_main_loop(); // Let's start the main loop.
                        amc_connect();
                    }, 0);
                }, 250);
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
}

function amc_connect() {
    global.ws = new WebSocket("ws://aronia.ee:4004");

    global.ws.onmessage = function (evt) {
        var received_msg = evt.data;
        var reader = new FileReader();

        reader.onload = function() {
            global.xt.terminal.write(reader.result);
        }

        reader.readAsText(evt.data);
    };

    global.ws.onclose = function() {
        global.xt.terminal.write("\n\r#Disconnected.");

        setTimeout(
            function() {
                global.xt.terminal.write("\n\r#Reconnecting...\n\r");
                amc_connect();
            }, 1000
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
