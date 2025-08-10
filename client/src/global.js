"use strict";

var global = {
    client : {
        name : "Arion MUD Client",
        version : "0.1"
    },
    homedir : "",
    font : {
        directory : "font",
        faces : [
            {
                family : "unscii",
                fname  : "unscii-16-full.woff"
            }
        ]
    },
    sfx : null,
    server : {
        host : null,
        port : null
    },
    ws : null,
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
            settings : {
                lerp : true
            },
            data : [],
            text : {
                data : [],
                utf8 : {
                    decoder : null,
                    packets : [],
                    time : 0
                }
            },
            ansi : {
                hidden : null,
                bold : null,
                faint: null,
                underline: null,
                blinking: null,
                reverse: null,
                italic: null,
                strikethrough: null,
                fg : null,
                sigreset : undefined
            },
            buffer : null,
            hidden : [],
            scrolled : {
                top : true,
                bottom : true
            }
        }
    },
    offscreen : {
        terminal : null,
        chatview : null,
        inputbar : null
    },
    buggy : {},
    last_interval : 0
};
