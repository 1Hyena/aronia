"use strict";

function amc_calc_panel_width() {
    var w = document.getElementById('amc-body').clientWidth;
    return Math.max(Math.floor(w / 8), 0);
}

function amc_calc_panel_height() {
    var h = document.getElementById('amc-body').clientHeight;
    return Math.max(Math.floor(h / 16), 0);
}

/*
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

function amc_get_foreground_panel_model(width, height) {
    let model = {
        width    : width,
        height   : height,
        vertical : false,
        contents : [
            {
                vertical: true,
                contents: [
                    {
                        key: "amc-panel-fg-top-left",
                        min_h: 1,
                        min_w: 1,
                        priority : 1
                    },
                    {
                        key: "amc-panel-fg-left",
                        min_h: 1,
                        min_w: 1,
                        priority : 1
                    },
                    {
                        key: "amc-panel-fg-bottom-left",
                        min_h: 1,
                        min_w: 1,
                        priority : 1
                    }
                ]
            },
            {
                vertical: true,
                contents: [
                    {
                        key: "amc-panel-fg-top",
                        min_h: 1,
                        min_w: 1,
                        priority : 1
                    },
                    {
                        key: "amc-panel-fg-middle",
                        min_h: 1,
                        min_w: 1,
                        priority : 1
                    },
                    {
                        key: "amc-panel-fg-bottom",
                        min_h: 8,
                        min_w: 44,
                        max_w: width,
                        max_h: height,
                        priority : 0
                    }
                ]
            },
            {
                vertical: true,
                contents: [
                    {
                        key: "amc-panel-fg-top-right",
                        min_h: 1,
                        min_w: 1,
                        priority : 1
                    },
                    {
                        key: "amc-panel-fg-bottom-right",
                        min_h: 1,
                        min_w: 1,
                        priority : 1
                    }
                ]
            }
        ]
    };

    return model;
}
*/

function amc_panel_layout_to_framework(layout) {
    let fw = {};

    if ("contents" in layout) {
/*
        fw.padding = "padding" in layout ? {
            top:  "top"  in layout.padding ? layout.padding.top  : 1,
            left: "left" in layout.padding ? layout.padding.left : 1
        } : {
            top:  1,
            left: 1
        };
*/
        let contents = [];
/*
        for (let i=0; i<layout.contents.length; ++i) {
            let content = layout.contents[i];

            if ("padding" in content == false
            || "bottom" in content.padding == false) {
                if ("padding" in layout && "bottom" in layout.padding) {
                    if ("padding" in content == false) {
                        content.padding = {};
                    }

                    content.padding.bottom = layout.padding.bottom;
                }
            }

            if ("padding" in content == false
            || "right" in content.padding == false) {
                if ("padding" in layout && "right" in layout.padding) {
                    if ("padding" in content == false) {
                        content.padding = {};
                    }

                    content.padding.right = layout.padding.right;
                }
            }
        }
*/
        for (let i=0; i<layout.contents.length; ++i) {
            let content = amc_panel_layout_to_framework(layout.contents[i]);

            if (content === null) {
                continue;
            }

            contents.push(content);
        }

        if (contents.length > 0) {
            fw.contents = contents;

            if ("vertical" in layout && layout.vertical) {
                fw.vertical = true;
            }
            else {
                fw.vertical = false;
            }

            fw.padding = "padding" in layout ? {
                top  : "top"  in layout.padding ? layout.padding.top  : 0,
                left : "left" in layout.padding ? layout.padding.left : 0
            } : {
                top : 0,
                left: 0
            };

            return fw;
        }

        return null;
    }

    fw.priority = (
        "priority" in layout ? layout.priority : Number.MAX_SAFE_INTEGER
    );

    fw.key   = "key" in layout ? layout.key : null;
    fw.min_w = "min_w" in layout ? layout.min_w : 1;
    fw.min_h = "min_h" in layout ? layout.min_h : 1;
    fw.max_w = "max_w" in layout ? layout.max_w : Number.MAX_SAFE_INTEGER;
    fw.max_h = "max_h" in layout ? layout.max_h : Number.MAX_SAFE_INTEGER;
    fw.pruned= false;
    fw.width = fw.min_w;
    fw.height= fw.min_h;

    fw.padding = "padding" in layout ? {
        right  : "right"  in layout.padding ? layout.padding.right  : 1,
        bottom : "bottom" in layout.padding ? layout.padding.bottom : 1
    } : {
        right : 1,
        bottom: 1
    };

    return fw;
}

function amc_panel_get_framework_width(framework) {
    if ("contents" in framework) {
        if (framework.vertical) {
            let max_content_w = 0;

            for (let i=0; i<framework.contents.length; ++i) {
                max_content_w = Math.max(
                    amc_panel_get_framework_width(framework.contents[i]),
                    max_content_w
                );
            }

            if (max_content_w <= 0) {
                return 0;
            }

            return max_content_w + framework.padding.left;
        }

        let width = 0;

        for (let i=0; i<framework.contents.length; ++i) {
            width += amc_panel_get_framework_width(framework.contents[i]);
        }

        if (width <= 0) {
            return 0;
        }

        return width + framework.padding.left;
    }

    return framework.pruned ? 0 : framework.width + framework.padding.right;
}

function amc_panel_get_framework_height(framework) {
    if ("contents" in framework) {
        if (framework.vertical == false) {
            let max_content_h = 0;

            for (let i=0; i<framework.contents.length; ++i) {
                max_content_h = Math.max(
                    amc_panel_get_framework_height(framework.contents[i]),
                    max_content_h
                );
            }

            if (max_content_h <= 0) {
                return 0;
            }

            return max_content_h + framework.padding.top;
        }

        let height = 0;

        for (let i=0; i<framework.contents.length; ++i) {
            height += amc_panel_get_framework_height(framework.contents[i]);
        }

        if (height <= 0) {
            return 0;
        }

        return height + framework.padding.top;
    }

    return framework.pruned ? 0 : framework.height + framework.padding.bottom;
}

function amc_panel_get_framework_cells(framework) {
    let contents = [];

    if ("contents" in framework) {
        for (let i=0; i<framework.contents.length; ++i) {
            contents.push(
                ...amc_panel_get_framework_cells(framework.contents[i])
            );
        }

        return contents;
    }

    return [framework];
}

function amc_panel_prune_framework(framework, max_width, max_height) {
    let cells = amc_panel_get_framework_cells(framework);

    cells.sort((a, b) => a.priority > b.priority ? -1 : 1);

    // how many combinations of pruned low priority cells do we test before
    // resorting to fall-back mechanics:
    let combo_cells = Math.min(cells.length, 8);
    let max_combos = Math.pow(2, combo_cells);

    for (let prune_combo = 1; prune_combo < max_combos; ++prune_combo) {
        let width = amc_panel_get_framework_width(framework);
        let height = amc_panel_get_framework_height(framework);

        if (width <= max_width && height <= max_height) {
            return;
        }

        for (let i=0; i<combo_cells; ++i) {
            if (prune_combo & Math.pow(2, i)) {
                cells[i].pruned = true;
            }
            else {
                cells[i].pruned = false;
            }
        }
    }

    // fall-back mechanic:

    while (cells.length > 0) {
        let cell = cells.shift();

        if (cell.pruned == true) {
            continue;
        }

        let width = amc_panel_get_framework_width(framework);

        if (width > max_width) {
            cell.pruned = true;

            let new_width = amc_panel_get_framework_width(framework);

            if (new_width < width) {
                continue;
            }

            cell.pruned = false;
        }

        let height = amc_panel_get_framework_height(framework);

        if (height > max_height) {
            cell.pruned = true;

            let new_height = amc_panel_get_framework_height(framework);

            if (new_height < height) {
                continue;
            }

            cell.pruned = false;
        }
    }
}

function amc_panel_inflate_framework(framework, width, height) {
    let vcells = amc_panel_get_framework_cells(framework);
    let hcells = [...vcells];
    let width_remaining = width;
    let height_remaining = height;

    while (hcells.length > 0) {
        let cell = hcells.shift();

        if (cell.pruned) {
            continue;
        }

        let cw = cell.width;

        if (cell.width < cell.max_w) {
            cell.width++;

            let next_width_remaining = (
                width - amc_panel_get_framework_width(framework)
            );

            if (next_width_remaining < 0) {
                cell.width--;
            }
            else width_remaining = next_width_remaining;
        }

        if (cw < cell.width) {
            hcells.push(cell);
        }
    }

    while (vcells.length > 0) {
        let cell = vcells.shift();

        if (cell.pruned) {
            continue;
        }

        let ch = cell.height;

        if (cell.height < cell.max_h) {
            cell.height++;

            let next_height_remaining = (
                height - amc_panel_get_framework_height(framework)
            );

            if (next_height_remaining < 0) {
                cell.height--;
            }
            else height_remaining = next_height_remaining;
        }

        if (ch < cell.height) {
            vcells.push(cell);
        }
    }
}

function amc_panel_situate_framework(framework, x, y) {
    if ("contents" in framework) {
        let dx = framework.padding.left;
        let dy = framework.padding.top;

        if (framework.vertical == false) {
            for (let i=0; i<framework.contents.length; ++i) {
                amc_panel_situate_framework(framework.contents[i], x+dx, y+dy);

                dx += amc_panel_get_framework_width(framework.contents[i]);
            }

            return;
        }

        for (let i=0; i<framework.contents.length; ++i) {
            amc_panel_situate_framework(framework.contents[i], x+dx, y+dy);

            dy += amc_panel_get_framework_height(framework.contents[i]);
        }

        return;
    }

    if (framework.pruned) {
        return;
    }

    framework.x = x;
    framework.y = y;
}

function amc_panel_calc_framework(layout, width, height) {
    let fw = amc_panel_layout_to_framework(layout);

    amc_panel_prune_framework(fw, width, height);
    amc_panel_inflate_framework(fw, width, height);
    amc_panel_situate_framework(fw, 0, 0);

    return fw;
}

function amc_panel_from_framework(framework) {
    // The framework should have top and left paddings defined because otherwise
    // it is impossible to determine the size of a single cell in the resulting
    // table and it gets messed up due to colspan and rowspan ambiguities.

    let width = amc_panel_get_framework_width(framework);
    let height = amc_panel_get_framework_height(framework);
    let map = new Array(height);

    for (let y = 0; y < map.length; ++y) {
        map[y] = new Array(width);
        map[y].fill(null);
    }

    let cells = amc_panel_get_framework_cells(framework);

    for (let i=0; i<cells.length; ++i) {
        let cell = cells[i];

        if (cell.pruned) {
            continue;
        }

        for (let y=0; y<cell.height; ++y) {
            for (let x=0; x<cell.width; ++x) {
                map[cell.y+y][cell.x+x] = cell;
            }
        }
    }

    let added = {};
    let table = document.createElement("table");

    table.classList.add("amc-tui");
    table.classList.add("ans-default");

    for (let y=0; y<map.length; ++y) {
        let tr = null;

        for (let x=0; x<map[y].length; ++x) {
            let cell = map[y][x];
            let key = cell ? cell.key : null;

            if (key === null) {
                if (tr === null) {
                    tr = document.createElement("tr");
                }

                let td = document.createElement("td");
                let pre = document.createElement("pre");

                pre.append(document.createTextNode(cell ? " " : "#"));

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

            td.setAttribute("colspan", cell.width);
            td.setAttribute("rowspan", cell.height);
            td.id = key;
            td.classList.add("amc-tui-cell");

            tr.append(td);
            added[key] = true;
        }

        if (tr !== null) {
            table.append(tr);
        }
    }

    return table;
}

function amc_panel_get_foreground_layout(width, height) {
    return {
        padding: {
            top: 1,
            left: 1
        },
        vertical : false,
        contents : [
            {
                vertical: true,
                contents: [
                    {
                        key: "amc-panel-fg-top-left",
                        priority : 5
                    },
                    {
                        key: "amc-panel-fg-left",
                        priority : 4
                    },
                    {
                        key: "amc-panel-fg-bottom-left",
                        priority : 3
                    }
                ]
            },
            {
                vertical: true,
                contents: [
                    {
                        key: "amc-panel-fg-top",
                        priority : 2
                    },
                    {
                        key: "amc-panel-fg-middle",
                        priority : 1
                    },
                    {
                        key: "amc-panel-fg-bottom",
                        priority : 0
                    }
                ]
            },
            {
                vertical: true,
                contents: [
                    {
                        key: "amc-panel-fg-top-right",
                        priority : 6
                    },
                    {
                        key: "amc-panel-fg-bottom-right",
                        priority : 7
                    }
                ]
            }
        ]
    };
}

function amc_panel_get_background_layout(width, height) {
    return {
        padding: {
            top: 1,
            left: 1
        },
        vertical: false,
        contents: [
            {
                vertical : true,
                contents : [
                    {
                        key: "amc-panel-top-left",
                        priority : 3
                    },
                    {
                        vertical : false,
                        contents : [
                            {
                                key: "amc-panel-below-top-left-1st",
                                priority : 5
                            },
                            {
                                key: "amc-panel-below-top-left-2nd",
                                priority: 4
                            }
                        ]
                    },
                    {
                        key: "amc-panel-bottom-left",
                        priority: 6
                    }, {
                        key: "amc-panel-below-bottom-left",
                        priority: 7
                    }
                ]
            },
            {
                vertical : true,
                contents : [
                    {
                        key: "amc-panel-console",
                        priority: 1
                    }, {
                        vertical : false,
                        contents : [
                            {
                                key: "amc-panel-below-console-left",
                                priority: 0
                            },
                            {
                                key: "amc-panel-below-console-right",
                                priority: 10
                            }
                        ]
                    }
                ]
            }
        ]
    };
}

/*
function amc_get_background_panel_model(width, height) {
    let central_top_height = Math.max(Math.floor(height / 2), 1);
    let console_min_width = width >= 82 ? 80 : Math.max(width - 2, 1);
    let bottom_left_max_w = Math.max(Math.floor(width / 2) - 40, 25);
    let zonemap_max_w = Math.floor(bottom_left_max_w / 2);
    let automap_max_w = Math.max(bottom_left_max_w - (zonemap_max_w + 1), 0);

    let model = {
        width    : width,
        height   : height,
        vertical : false,
        contents : [
            {
                vertical : true,
                contents : [
                    {
                        key: "amc-panel-top-left",
                        //min_h: 1,
                        //min_w: bottom_left_max_w,
                        //max_w: bottom_left_max_w,
                        priority : 3
                    },
                    {
                        vertical : false,
                        contents : [
                            {
                                key: "amc-panel-below-top-left-1st",
                                //min_w: 1,
                                //max_w: automap_max_w,
                                //min_h: 1,
                                priority : 5
                            },
                            {
                                key: "amc-panel-below-top-left-2nd",
                                //min_w: 1,
                                //max_w: zonemap_max_w,
                                //min_h: 1,
                                priority: 4
                            }
                        ]
                    },
                    {
                        key: "amc-panel-bottom-left",
                        //min_w: bottom_left_max_w,
                        //min_h: 1,
                        //max_w: bottom_left_max_w,
                        priority: 6
                    }, {
                        key: "amc-panel-below-bottom-left",
                        //min_w: bottom_left_max_w,
                        //min_h: 1,
                        //max_h: 1,
                        //max_w: bottom_left_max_w,
                        priority: 7
                    }
                ]
            },
            {
                vertical : true,
                contents : [
                    {
                        key: "amc-panel-console",
                        min_w: Math.max(8, console_min_width),
                        priority: 1
                    }, {
                        vertical : false,
                        contents : [
                            {
                                key: "amc-panel-below-console-left",
                                min_w: Math.max(1, console_min_width),
                                max_w: Math.max(1, console_min_width),
                                max_h: 1,
                                priority: 0
                            },
                            {
                                key: "amc-panel-below-console-right",
                                max_h: 1,
                                priority: 10
                            }
                        ]
                    }
                ]
            }
        ]
    };

    return model;
}

function amc_create_panel_framework(model) {
    let width = model.width;
    let height = model.height;
    let reserve_border = [ model ];

    while (reserve_border.length > 0) {
        let fw = reserve_border.pop();

        if ("contents" in fw == false) {
            if ("min_w" in fw) {
                fw.min_w += 1;
            }
            else fw.min_w = 1;

            if ("min_h" in fw) {
                fw.min_h += 1;
            }
            else fw.min_h = 1;

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
        amc_fill_panel_framework(model, 0, 0);

        if (model.width <= width && model.height <= height) {
            break;
        }

        amc_crop_panel_framework(model);
    };

    amc_fill_panel_framework(model, width, height);

    let buf = [ { data : model, x : 0, y : 0 } ];

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

    return model;
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
    let map = new Array(framework.height + 1);
    let tui = {};

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
    table.classList.add("ans-default");

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
            td.classList.add("amc-tui-cell");

            tr.append(td);

            added[key] = true;
        }

        if (tr !== null) {
            table.append(tr);
        }
    }

    return table;
}
*/

function amc_init_panel(width, height) {
    /*
    let panel_bg = amc_create_panel(
        amc_create_panel_framework(amc_get_background_panel_model(width, height))
    );

    let panel_fg = amc_create_panel(
        amc_create_panel_framework(amc_get_foreground_panel_model(width, height))
    );
    */

    let panel_bg = amc_panel_from_framework(
        amc_panel_calc_framework(
            amc_panel_get_background_layout(width, height),  width, height
        )
    );

    let panel_fg = amc_panel_from_framework(
        amc_panel_calc_framework(
            amc_panel_get_foreground_layout(width, height),  width, height
        )
    );

    panel_fg.classList.add("amc-tui-fg");

    amc_deinit_terminal();
    amc_deinit_chatview();
    amc_deinit_inputbar();

    document.getElementById("amc-panel-wrapper").replaceChildren(
        panel_bg, panel_fg
    );

    amc_init_terminal(document.getElementById("amc-panel-console"));
    amc_init_inputbar(document.getElementById("amc-panel-below-console-left"));
    amc_init_mainview(document.getElementById("amc-panel-below-top-left-1st"));
    amc_init_zoneview(document.getElementById("amc-panel-below-top-left-2nd"));
    amc_init_foreview(document.getElementById("amc-panel-fg-top-right"));
    amc_init_chatview(document.getElementById("amc-panel-chatview"));
    amc_init_statview(document.getElementById("amc-panel-top-left"));
    amc_init_itemview(document.getElementById("amc-panel-miscview"));
    amc_init_roomview(document.getElementById("amc-panel-bottom-left"));

    if (msdp.lists.REPORTABLE_VARIABLES !== null) {
        for (let i=0; i<msdp.lists.REPORTABLE_VARIABLES.length; ++i) {
            let key = msdp.lists.REPORTABLE_VARIABLES[i];

            if (key in msdp.variables && msdp.variables[key] !== null) {
                msdp_update_variable(key, msdp.variables[key]);
            }
        }
    }

    amc_show_mudstate(amc_get_mud_state());

    return;
}
