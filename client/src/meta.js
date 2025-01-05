"use strict";

function meta_log(text, arg) {
    arg = typeof arg !== 'undefined' ? arg : null;

    var unit = location.pathname.split("/").slice(-1).pop();

    if (arg === null) {
        if (unit === "") {
            console.log(text);
        }
        else {
            console.log(unit+": "+text);
        }
    }
    else {
        if (unit === "") {
            console.log(text, arg);
        }
        else {
            console.log(unit+": "+text, arg);
        }
    }
}

function meta_error(text) {
    var unit = location.pathname.split("/").slice(-1).pop();

    if (unit === "") {
        console.error(text);
    }
    else {
        console.error(unit+": "+text);
    }
}

function meta_init_loading() {
    var noscript_wrapper = document.getElementById("meta-no-script-wrapper");
    noscript_wrapper.classList.add("fade-out");

    setTimeout(
        function(){
            setTimeout(
                function(){
                    var meta_loader = document.getElementById("meta-loader");
                    meta_loader.setAttribute("data-loaded", "");

                    window.addEventListener(
                        'beforeunload',
                        function (e) {
                            delete e['returnValue'];
                            meta_fade_out();
                        }
                    );
                }, 0
            );
        },
        // Let's wait for the no-script-wrapper fade-out animation to complete.
        250
    );

    meta_log("Loading the resources.");
}


function meta_deinit_loading() {
    window.addEventListener(
        "load",
        function() {
            meta_wait();
        }
    );

    meta_log("Almost done loading.");
}

function meta_wait() {
    var meta_loader = document.getElementById("meta-loader");

    if (meta_loader.hasAttribute("data-loaded")) {
        meta_log("Starting up the engine.");
        main();
        return;
    }

    setTimeout(
        function(){
            meta_wait();
        }, 250
    );
}

function meta_fade_out() {
    var body = document.getElementsByTagName('body')[0];

    if (body !== null) {
        if (body.classList.contains('fade-in')) {
            body.classList.remove('fade-in');
        }

        if (!body.classList.contains('fade-out')) {
            body.classList.add('fade-out');
        }
    }
}

function meta_show_progress(text, fsize, tsize) {
    fsize = parseInt(fsize, 10);
    tsize = parseInt(tsize, 10);

    var progress_bg  = document.getElementById("meta-progress-bg");
    var progress_buf = document.getElementById("meta-progress-buf");
    var progress     = document.getElementById("meta-progress-fg");
    var progress_left= document.getElementById("meta-progress-left");
    var progress_done= document.getElementById("meta-progress-done");
    var txt          = document.getElementById("meta-progress-txt");
    var loaded       = parseInt(progress.getAttribute('data-loaded'), 10);
    var buffer       = parseInt(progress.getAttribute('data-buffer'), 10);
    progress.setAttribute('data-buffer', buffer + fsize);
    progress.setAttribute('data-total',  tsize);

    var p = ((100*(loaded + buffer))/tsize).toFixed(3);
    txt.setAttribute('data-text', Math.ceil(p).toFixed(0)+"%");

    progress.style.width = p+"%";
    progress_left.style.width = (100-p)+"%";

    p = ((100*(buffer))/(loaded + buffer)).toFixed(3);
    progress_buf.style.width = p+"%";
    progress_done.style.width = (100-p)+"%";

    if (!progress_bg.classList.contains("appear")) {
        progress_bg.classList.add("appear");
    }
}

function meta_resource_loaded(id) {
    var e = document.getElementById(id);
    var progress = document.getElementById("meta-progress-fg");
    var progress_left= document.getElementById("meta-progress-left");
    var progress_done= document.getElementById("meta-progress-done");
    var progress_buf = document.getElementById("meta-progress-buf");
    var txt          = document.getElementById("meta-progress-txt");

    if (e !== null && progress !== null && progress_buf !== null) {
        var fsize  = parseInt(e.getAttribute('data-fsize'), 10);
        var buffer = parseInt(progress.getAttribute('data-buffer'), 10);
        var loaded = parseInt(progress.getAttribute('data-loaded'), 10);
        var tsize  = parseInt(progress.getAttribute('data-total' ), 10);
        progress.setAttribute('data-loaded', (loaded + fsize));
        progress.setAttribute('data-buffer', (buffer - fsize));

        var p = ((100*(loaded + buffer))/tsize).toFixed(3);
        progress.style.width = p+"%";
        progress_left.style.width = (100-p)+"%";

        p = ((100*(buffer - fsize))/(loaded + buffer - fsize)).toFixed(3);
        progress_buf.style.width = p+"%";
        progress_done.style.width = (100-p)+"%";

        if (loaded + fsize >= tsize) {
            txt.setAttribute('data-text', "Please wait...");
        }
    }
}

function meta_load_artwork(id) {
    var bg = document.getElementById(id);
    if (bg === null) return;

    if (bg.getAttribute('data-bg') !== "") return;

    bg.addEventListener(
        "load",
        function() {
            // Let's show the background image immediately after it has been
            // loaded.

            var bg_div = document.getElementById("meta-bg");

            if (bg_div === null || this === null) {
                return;
            }

            if (bg_div.classList.contains("fade-in")) {
                return;
            }

            if (this.hasAttribute("data-pos")) {
                bg_div.style.backgroundPosition = this.getAttribute('data-pos');
            }

            bg_div.style.backgroundImage = "url("+this.src+")";
            bg_div.classList.add("fade-in");
        }
    );

    var artwork = [
        {
            image : "landscape.jpg"
        },
        {
            image : "landscape.jpg"
        },
        {
            image : "landscape.jpg",
            position : "center"
        }
    ];

    shuffle(artwork);

    var path = "../gfx";

    if (typeof COMPILE_TIME !== 'undefined') {
        path = "gfx";
    }

    var bg_style = artwork.pop();
    var bg_fname = bg_style.image;

    bg.setAttribute('data-bg', bg_fname);

    if ("position" in bg_style) {
        bg.setAttribute('data-pos', bg_style.position);
    }

    bg.src = path+"/"+bg_fname;
}
