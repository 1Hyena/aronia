"use strict";

function amc_calc_panel_width() {
    var w = document.getElementById('amc-body').clientWidth;
    return Math.max(Math.floor(w / 8) - 1, 0);
}

function amc_calc_panel_height() {
    var h = document.getElementById('amc-body').clientHeight;
    return Math.max(Math.floor(h / 16) - 1, 0);
}

function amc_fill_panel_framework(framework, width, height) {
    if ("contents" in framework == false) {
        framework.width = width;
        framework.height = height;

        if ("min_w" in framework && framework.width < framework.min_w) {
            framework.width = framework.min_w;
        }

        if ("min_h" in framework && framework.height < framework.min_h) {
            framework.height = framework.min_h;
        }

        if ("max_w" in framework && framework.width > framework.max_w) {
            framework.width = framework.max_w;
        }

        if ("max_h" in framework && framework.height > framework.max_h) {
            framework.height = framework.max_h;
        }

        return;
    }

    let length = framework.contents.length;
    let total_w = 0;
    let total_h = 0;
    let forebuf = [...framework.contents];
    let backbuf = [];
    let finalized = 0;

    if (framework.vertical) {
        let remaining = height;

        do {
            while (forebuf.length > 0) {
                let h = Math.floor(Math.max(remaining, 0) / forebuf.length);
                let fw = forebuf.shift();
                let before = fw.height;

                amc_fill_panel_framework(fw, width, h);

                remaining -= fw.height;

                if (before !== fw.height) {
                    backbuf.push(fw);
                }
                else finalized += fw.height;
            }

            remaining = height - finalized;
            forebuf = backbuf;
            backbuf = [];
        } while (forebuf.length > 0 && remaining > 0);

        for (let i=0; i<framework.contents.length; ++i) {
            total_h += framework.contents[i].height;
            total_w = Math.max(total_w, framework.contents[i].width);
        }

        if (total_w > width) {
            for (let i=0; i<framework.contents.length; ++i) {
                if (framework.contents[i].width < total_w) {
                    amc_fill_panel_framework(
                        framework.contents[i],
                        total_w, framework.contents[i].height
                    );
                }
            }
        }
    }
    else {
        let remaining = width;

        do {
            while (forebuf.length > 0) {
                let w = Math.floor(Math.max(remaining, 0) / forebuf.length);
                let fw = forebuf.shift();
                let before = fw.width;

                amc_fill_panel_framework(fw, w, height);

                remaining -= fw.width;

                if (before !== fw.width) {
                    backbuf.push(fw);
                }
                else finalized += fw.width;
            }

            remaining = width - finalized;
            forebuf = backbuf;
            backbuf = [];
        } while (forebuf.length > 0 && remaining > 0);

        for (let i=0; i<framework.contents.length; ++i) {
            total_w += framework.contents[i].width;
            total_h = Math.max(total_h, framework.contents[i].height);
        }

        if (total_h > height) {
            for (let i=0; i<framework.contents.length; ++i) {
                if (framework.contents[i].height < total_h) {
                    amc_fill_panel_framework(
                        framework.contents[i],
                        framework.contents[i].width, total_h
                    );
                }
            }
        }
    }

    framework.width = total_w;
    framework.height = total_h;
}

function amc_crop_panel_framework(framework) {
    let next = [ framework ];
    let worst = null;

    while (next.length > 0) {
        let fw = next.pop();

        if ("contents" in fw == false) {
            if (worst === null || fw.priority > worst.priority) {
                worst = fw;
            }

            continue;
        }

        for (let i=0; i<fw.contents.length; ++i) {
            next.push(fw.contents[i]);
        }
    }

    let again = false;

    do {
        again = false;
        next = [ framework ];

        while (next.length > 0) {
            let fw = next.pop();

            if ("contents" in fw == false) {
                continue;
            }

            for (let i=0; i<fw.contents.length; ++i) {
                if (fw.contents[i] === worst) {
                    fw.contents.splice(i, 1);

                    if (fw.contents.length === 0) {
                        worst = fw;
                        again = true;
                        break;
                    }

                    return;
                }

                next.push(fw.contents[i]);
            }

            if (again === true) {
                break;
            }
        }
    } while (again);
}

function amc_calc_panel_framework(width, height) {
    let central_top_height = Math.max(Math.floor(height / 2), 1);
    let console_min_width = width >= 82 ? 80 : Math.max(width - 2, 1);
    let bottom_left_max_w = Math.max(Math.floor(width / 2) - 40, 1);

    let framework = {
        vertical : true,
        contents : [
            {
                vertical : false,
                contents : [
                    {
                        vertical : true,
                        contents : [
                            {
                                key: "amc-panel-char-sheet",
                                min_w : 20,
                                min_h : 6,
                                priority : 3
                            }, {
                                vertical : false,
                                contents : [
                                    {
                                        key: "amc-panel-below-char-sheet-1st",
                                        min_w: 8,
                                        min_h: 6,
                                        priority : 8
                                    },
                                    {
                                        key: "amc-panel-below-char-sheet-2nd",
                                        min_w: 5,
                                        min_h: 3,
                                        priority: 4
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        key: "amc-panel-central-top",
                        min_w: Math.max(17, 2*central_top_height),
                        min_h: Math.max(9, central_top_height),
                        max_w: 2*central_top_height,
                        max_h: central_top_height,
                        priority : 2
                    }, {
                        vertical : true,
                        contents : [
                            {
                                key: "amc-panel-top-right",
                                min_w: 20,
                                min_h: 2,
                                priority : 5
                            }, {
                                key: "amc-panel-below-top-right",
                                min_w: 8,
                                min_h: 7,
                                priority : 6
                            }
                        ]
                    }
                ]
            },
            {
                vertical : false,
                contents : [
                    {
                        vertical : true,
                        contents : [
                            {
                                key: "amc-panel-bottom-left",
                                min_w: 8,
                                min_h: 6,
                                max_w: bottom_left_max_w,
                                priority: 7
                            }, {
                                key: "amc-panel-below-bottom-left",
                                min_w: 1,
                                min_h: 1,
                                max_h: 1,
                                max_w: bottom_left_max_w,
                                priority: 9
                            }
                        ]
                    },
                    {
                        vertical : true,
                        contents : [
                            {
                                key: "amc-panel-console",
                                min_w: Math.max(8, console_min_width),
                                min_h: 3,
                                priority: 1
                            }, {
                                vertical : false,
                                contents : [
                                    {
                                        key: "amc-panel-below-console-left",
                                        min_w: Math.max(1, console_min_width),
                                        min_h: 1,
                                        max_w: 80,
                                        max_h: 1,
                                        priority: 0
                                    },
                                    {
                                        key: "amc-panel-below-console-right",
                                        min_w: 1,
                                        min_h: 1,
                                        max_h: 1,
                                        priority: 10
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };

    let reserve_border = [ framework ];

    while (reserve_border.length > 0) {
        let fw = reserve_border.pop();

        if ("contents" in fw == false) {
            if ("min_w" in fw) {
                fw.min_w += 1;
            }

            if ("min_h" in fw) {
                fw.min_h += 1;
            }

            if ("max_w" in fw) {
                fw.max_w += 1;
            }

            if ("max_h" in fw) {
                fw.max_h += 1;
            }

            continue;
        }

        for (let i=0; i<fw.contents.length; ++i) {
            reserve_border.push(fw.contents[i]);
        }
    }

    for (let i=0; i<=10; ++i) {
        amc_fill_panel_framework(framework, 0, 0);

        if (framework.width <= width && framework.height <= height) {
            break;
        }

        amc_crop_panel_framework(framework);
    };

    amc_fill_panel_framework(framework, width, height);

    let buf = [ { data : framework, x : 0, y : 0 } ];

    while (buf.length > 0) {
        let fw = buf.shift();

        fw.data.x = fw.x;
        fw.data.y = fw.y;

        if ("contents" in fw.data == false) {
            continue;
        }

        if (fw.data.vertical === true) {
            let dy = 0;

            for (let i=0; i<fw.data.contents.length; ++i) {
                buf.push(
                    {
                        data : fw.data.contents[i],
                        x : fw.x,
                        y : fw.y + dy
                    }
                );

                dy += fw.data.contents[i].height;
            }
        }
        else {
            let dx = 0;

            for (let i=0; i<fw.data.contents.length; ++i) {
                buf.push(
                    {
                        data : fw.data.contents[i],
                        x : fw.x + dx,
                        y : fw.y
                    }
                );

                dx += fw.data.contents[i].width;
            }
        }
    }

    return framework;
}

function amc_get_border_symbol(map, x, y) {
    let bits = 0;

    if (y > 0                   && !map[y-1][x]) bits += 0b0001; // north
    if (y + 1 < map.length      && !map[y+1][x]) bits += 0b0010; // south
    if (x + 1 < map[y].length   && !map[y][x+1]) bits += 0b0100; // east
    if (x > 0                   && !map[y][x-1]) bits += 0b1000; // west

    switch (bits) {
        case 0b0011: return "║";
        case 0b0101: return "╚";
        case 0b0110: return "╔";
        case 0b0111: return "╠";
        case 0b1001: return "╝";
        case 0b1010: return "╗";
        case 0b1011: return "╣";
        case 0b1100: return "═";
        case 0b1101: return "╩";
        case 0b1110: return "╦";
        case 0b1111: return "╬";
        default: break;
    }

    return " ";
}

function amc_create_panel(framework) {
    let buf = [ ...framework.contents ];
    var map = new Array(framework.height + 1);
    var tui = {};

    for (let y = 0; y < map.length; ++y) {
        map[y] = new Array(framework.width + 1);
        map[y].fill(null);
    }

    while (buf.length > 0) {
        let fw = buf.pop();

        if ("contents" in fw == false) {
            if ("key" in fw) {
                tui[fw.key] = fw;

                for (let y=1; y<fw.height; ++y) {
                    for (let x=1; x<fw.width; ++x) {
                        map[fw.y+y][fw.x+x] = fw.key;
                    }
                }
            }

            continue;
        }

        buf.push(...fw.contents);
    }

    let added = {};
    let table = document.createElement("table");

    table.classList.add("amc-tui");

    for (let y=0; y<map.length; ++y) {
        let tr = null;

        for (let x=0; x<map[y].length; ++x) {
            let key = map[y][x];

            if (key === null || key in tui == false) {
                if (tr === null) {
                    tr = document.createElement("tr");
                }

                let td = document.createElement("td");
                let pre = document.createElement("pre");

                pre.append(
                    document.createTextNode(amc_get_border_symbol(map, x, y))
                );

                td.append(pre);
                tr.append(td);

                continue;
            }

            if (key in added) {
                continue;
            }

            if (tr === null) {
                tr = document.createElement("tr");
            }

            let td = document.createElement("td");

            td.setAttribute("colspan", tui[key].width - 1);
            td.setAttribute("rowspan", tui[key].height - 1);
            td.id = key;
            td.classList.add("amc-panel");

            tr.append(td);

            added[key] = true;
        }

        if (tr !== null) {
            table.append(tr);
        }
    }

    return table;
}

function amc_init_panel(width, height) {
    let fw = amc_calc_panel_framework(width, height);
    let panel = amc_create_panel(fw);

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

    if (global.offscreen.inputbar === null) {
        var view = document.getElementById("amc-inputbar");

        if (view !== null) {
            view.parentNode.removeChild(view);
            global.offscreen.inputbar = view;
        }
    }

    document.getElementById("amc-panel-wrapper").replaceChildren(panel);

    var panel_console = document.getElementById("amc-panel-console");

    if (panel_console !== null && global.offscreen.terminal !== null) {
        var wrapper = document.createElement("div");
        wrapper.id = global.offscreen.terminal.id+"-wrapper";
        wrapper.append(global.offscreen.terminal);
        panel_console.append(wrapper);
        global.offscreen.terminal = null;

        scroll_to_bottom("amc-terminal-wrapper");
    }

    var panel_top_right = document.getElementById("amc-panel-top-right");

    if (panel_top_right !== null && global.offscreen.chatview !== null) {
        var wrapper = document.createElement("div");
        wrapper.id = global.offscreen.chatview.id+"-wrapper";
        wrapper.append(global.offscreen.chatview);
        panel_top_right.append(wrapper);
        global.offscreen.chatview = null;
    }

    var panel_below_console_left = document.getElementById(
        "amc-panel-below-console-left"
    );

    if (panel_below_console_left !== null
    && global.offscreen.inputbar !== null) {
        var wrapper = document.createElement("div");
        wrapper.id = global.offscreen.inputbar.id+"-wrapper";
        wrapper.append(global.offscreen.inputbar);
        panel_below_console_left.append(wrapper);
        global.offscreen.inputbar = null;
    }

    amc_init_mainview(document.getElementById("amc-panel-central-top"));

    amc_init_zoneview(
        document.getElementById("amc-panel-below-char-sheet-2nd")
    );

    amc_init_statview(document.getElementById("amc-panel-char-sheet"));

    amc_init_eqview(document.getElementById("amc-panel-below-char-sheet-1st"));
    amc_init_inventory_view(document.getElementById("amc-panel-bottom-left"));
    amc_init_roomview(document.getElementById("amc-panel-below-top-right"));

    return;
}
