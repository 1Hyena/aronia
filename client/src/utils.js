"use strict";

function get_timestamp() {
    return Math.floor(Date.now() / 1000);
}

function get_timestamp_age(unix_timestamp) {
    return Math.floor(Date.now() / 1000) - unix_timestamp;
}

function get_timestring(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp*1000);
    //a = new Date(a.getTime() - a.getTimezoneOffset() * 60000);

    var year = a.getFullYear();
    var month = (a.getMonth() + 1).toString().padStart(2, '0');
    var day = a.getDate().toString().padStart(2, '0');
    var hour = a.getHours().toString().padStart(2, '0');
    var min = a.getMinutes().toString().padStart(2, '0');
    var sec = a.getSeconds().toString().padStart(2, '0');
    var time = day+'.'+month+'.'+year+' '+hour+':'+min+':'+sec;

    return time;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

function init_sound() {
    var channel_max = 10;
    var audiochannels = new Array();

    for (var a=0; a<channel_max; a++) {
        audiochannels[a] = {
            audio : null,
            volume : 1,
            rate : 1,
            pan : 0,
            finished : true,
            panner : null,
            source : null
        };
    }

    return {
        channels : audiochannels,
        context : null
    };
}

function play_sound(audio_id, volume, rate, pan) {
    if (document.hidden) return;

    volume = typeof volume !== 'undefined' ? volume : 1.0;
    rate   = typeof rate   !== 'undefined' ? rate   : 1.0;
    pan    = typeof pan    !== 'undefined' ? pan    : 0.0;

    var audiochannels = (
        typeof global !== 'undefined' ? global.sfx.channels : null
    );

    if (audiochannels === null) return;

    var sfx = document.getElementById(audio_id);

    if (sfx === null || sfx.muted) return;

    var master_volume = 1.0;

    volume = volume * master_volume;

    for (var a=0; a<audiochannels.length; a++) {
        var chan = audiochannels[a];

        if (chan['finished'] == false) {
            continue;
        }

        if (chan.audio === null) {
            chan.audio = new Audio();
            chan.audio.addEventListener('canplay', start_sound, false);
            chan.audio.addEventListener('ended',   end_sound,   false);
        }

        chan.volume = volume;
        chan.rate = rate;
        chan.pan = pan;
        chan.finished = false;

        chan.audio.src = sfx.src;
        chan.audio.load();

        break;
    }
}

function start_sound(e) {
    var audiochannels = (
        typeof global !== 'undefined' ? global.sfx.channels : null
    );

    if (audiochannels === null) return;

    for (var a=0; a<audiochannels.length; a++) {
        var chan = audiochannels[a];

        if (chan.audio !== e.currentTarget) {
            continue;
        }

        if ("preservesPitch" in chan.audio
        ||  "mozPreservesPitch" in chan.audio
        ||  "webkitPreservesPitch" in chan.audio) {
            chan.audio.playbackRate = chan['rate'];
            chan.audio.preservesPitch = false;
            chan.audio.mozPreservesPitch = false;
            chan.audio.webkitPreservesPitch = false;
        }

        chan.audio.volume = chan.volume;

        if (global.sfx.context !== null && chan.source === null) {
            chan.source = global.sfx.context.createMediaElementSource(
                chan.audio
            );
            chan.panner = global.sfx.context.createStereoPanner();
            chan.source.connect(chan.panner);
            chan.panner.connect(global.sfx.context.destination);
        }

        if (chan.panner !== null) {
            chan.panner.pan.value = chan.pan;
        }

        var promise = chan.audio.play();

        if (promise !== undefined) {
            promise.then(
                function() {
                    if (global.sfx.context === null) {
                        global.sfx.context = new (
                            window.AudioContext || window.webkitAudioContext
                        )();
                    }

                    return;
                },
                function() {
                    chan.finished = true;
                }
            );
        }

        break;
    }
}

function end_sound(e) {
    var audiochannels = (
        typeof global !== 'undefined' ? global.sfx.channels : null
    );

    if (audiochannels === null) return;

    for (var a=0; a<audiochannels.length; a++) {
        var chan = audiochannels[a];

        if (chan.audio !== e.currentTarget) {
            continue;
        }

        chan.finished = true;

        break;
    }
}

function stop_all_sound() {
    var audiochannels = (
        typeof global !== 'undefined' ? global.sfx.channels : null
    );

    for (var a=0; a<audiochannels.length; a++) {
        if (audiochannels[a].finished) continue;

        var audio = audiochannels[a].audio;
        var promise = audio.pause();

        if (promise !== undefined) {
            promise.then(
                function(){
                    audiochannels[a].finished = true;
                    audiochannels[a].currentTime = 0;
                },
                function(){
                    audiochannels[a].finished = true;
                    audiochannels[a].currentTime = 0;
                }
            );
        }
    }
}

function get_timestamp() {
    return Math.floor(Date.now() / 1000);
}

function get_timestamp_age(unix_timestamp) {
    return Math.floor(Date.now() / 1000) - unix_timestamp;
}

function get_caller() {
    try {
        throw new Error();
    } catch (e) {
        var all = e.stack.match(/(\w+)@|at (\w+) \(/g);

        if (all.length >= 3) {
            var parent = all[2].match(/(\w+)@|at (\w+) \(/);
            return parent[1] || parent[2];
        }
    }

    return "unknown caller";
}

function is_visible(container, element, partial) {
    //Get container properties
    var cTop = container.scrollTop;
    var cBottom = cTop + container.clientHeight;

    //Get element properties
    var eTop = element.offsetTop;
    var eBottom = eTop + element.clientHeight;

    //Check if in view
    var isTotal = (eTop >= cTop && eBottom <= cBottom);
    var isPartial = partial && (
        (eTop < cTop && eBottom > cTop) ||
        (eBottom > cBottom && eTop < cBottom)
    );

    //Return outcome
    return (isTotal || isPartial);
}

function is_scrolled_top(container) {
    return container !== null ? (Math.floor(container.scrollTop) === 0) : false;
}

function is_scrolled_bottom(container) {
    return container !== null ? (
        (
        container.scrollHeight - Math.ceil(container.scrollTop)
        ) <= container.clientHeight
    ) : false;
}

function scroll_to_bottom(container_id) {
    setTimeout(
        function(id) {
            var view = document.getElementById(id);

            if (view !== null) {
                view.scrollTop = view.scrollHeight;
            }
        }, 1, container_id
    );
}

function capitalize(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function log(text) {
    console.log(text);
}

function bug(arg) {
    arg = typeof arg !== 'undefined' ? arg : null;

    var caller = get_caller();

    if (caller+"" in global.buggy == false) {
        if (arg !== null) {
            log(
                "forbidden condtion '"+arg+"' has been met ("+caller+")"
            );
        }
        else {
            log("forbidden condtion has been met ("+caller+")");
        }

        console.trace();
        global.buggy[caller+""] = true;
    }
}

function get_caller() {
    try {
        throw new Error();
    } catch (e) {
        var all = e.stack.match(/(\w+)@|at (\w+) \(/g);

        if (all.length >= 3) {
            var parent = all[2].match(/(\w+)@|at (\w+) \(/);
            return parent[1] || parent[2];
        }
    }

    return "unknown caller";
}

function strip_ansiesc(str) {
    var regex = new RegExp(
        "[\\u001b\\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?"+
        "[0-9A-ORZcf-nqry=><]", "g"
    );

    return str.replace(regex, '');
}

function is_same_classlist({classList: x}, {classList: y}) {
    return [...x].every(z=>y.contains(z)) && [...y].every(z=>x.contains(z));
}
