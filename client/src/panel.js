"use strict";

function amc_get_scale() {
    if (document.documentElement.classList.contains("amc-gui-x2")) {
        return 2.0;
    }

    return 1.0;
}

function amc_calc_panel_width() {
    var w = document.getElementById('amc-body').clientWidth;
    return Math.max(Math.floor(w / (8 * amc_get_scale())), 0);
}

function amc_calc_panel_height() {
    var h = document.getElementById('amc-body').clientHeight;
    return Math.max(Math.floor(h / (16 * amc_get_scale())), 0);
}

function amc_panel_layout_to_framework(layout) {
    let fw = {};

    if ("contents" in layout) {
        let contents = [];

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

    hcells.sort((a, b) => a.width > b.width ? 1 : -1);

    let last_w = 0;

    while (hcells.length > 0) {
        for (let i=0; i<hcells.length; ++i) {
            let cell = hcells[i];
            let cw = cell.width;

            if (cell.pruned || cw >= cell.max_w) {
                hcells[i] = null;
                continue;
            }

            if (last_w < cw) {
                ++last_w;
                break;
            }

            cell.width++;

            let next_width_remaining = (
                width - amc_panel_get_framework_width(framework)
            );

            if (next_width_remaining < 0) {
                cell.width--;
                hcells[i] = null;
            }
            else width_remaining = next_width_remaining;
        }

        hcells = hcells.filter(
            function (el) {
                return el !== null;
            }
        );
    }

    vcells.sort((a, b) => a.height > b.height ? 1 : -1);

    let last_h = 0;

    while (vcells.length > 0) {
        for (let i=0; i<vcells.length; ++i) {
            let cell = vcells[i];
            let ch = cell.height;

            if (cell.pruned || ch >= cell.max_h) {
                vcells[i] = null;
                continue;
            }

            if (last_h < ch) {
                ++last_h;
                break;
            }

            cell.height++;

            let next_height_remaining = (
                height - amc_panel_get_framework_height(framework)
            );

            if (next_height_remaining < 0) {
                cell.height--;
                vcells[i] = null;
            }
            else height_remaining = next_height_remaining;
        }

        vcells = vcells.filter(
            function (el) {
                return el !== null;
            }
        );
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

function amc_panel_get_border_symbol(map, x, y) {
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

                pre.append(
                    document.createTextNode(
                        amc_panel_get_border_symbol(map, x, y)
                    )
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
                        priority : 0,
                        min_h: 8,
                        min_w: 44
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
    let sidebar_width = 40;
    let console_width = 80 + 1; // need extra space for scrollbar

    let padding_min_width = Math.max(width - (console_width+sidebar_width+4), 0);

    if (padding_min_width > sidebar_width) {
        padding_min_width = Math.floor((padding_min_width + sidebar_width)/2);
    }

    let command_min_width = Math.max(
        Math.min(width-(sidebar_width+padding_min_width+4), console_width), 0
    );

    if (padding_min_width <= 0) {
        padding_min_width = width; // let's force pruning
        command_min_width = console_width;
    }

    if (command_min_width + 2 > width) {
        command_min_width = Math.max(width - 2, 0);
    }

    let command_max_width = command_min_width;
    let padding_max_width = padding_min_width;

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
                        priority : 3,
                        min_w: 19,
                        min_h: 5
                    },
                    {
                        vertical : false,
                        contents : [
                            {
                                key: "amc-panel-below-top-left-1st",
                                priority : 5,
                                min_w : 21,
                                min_h : 11
                            },
                            {
                                key: "amc-panel-below-top-left-2nd",
                                priority: 4,
                                min_w: 5,
                                min_h: 3
                            }
                        ]
                    },
                    {
                        key: "amc-panel-bottom-left",
                        priority: 6
                    }, {
                        key: "amc-panel-below-bottom-left",
                        priority: 7,
                        max_h: 1
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
                                priority: 0,
                                max_h: 1,
                                min_w: command_min_width,
                                max_w: command_max_width
                            },
                            {
                                key: "amc-panel-below-console-right",
                                priority: 10,
                                max_h: 1,
                                min_w: padding_min_width,
                                max_w: padding_max_width
                            }
                        ]
                    }
                ]
            }
        ]
    };
}

function amc_init_panel(width, height) {
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
    amc_deinit_pageview();
    amc_deinit_gearview();

    document.getElementById("amc-panel-wrapper").replaceChildren(
        panel_bg, panel_fg
    );

    amc_init_terminal(document.getElementById("amc-panel-console"));
    amc_init_inputbar(document.getElementById("amc-panel-below-console-left"));
    amc_init_mainview(document.getElementById("amc-panel-below-top-left-1st"));
    amc_init_zoneview(document.getElementById("amc-panel-below-top-left-2nd"));
    amc_init_foreview(document.getElementById("amc-panel-fg-top-right"));
    amc_init_pageview(document.getElementById("amc-panel-miscview"));
    amc_init_chatview(document.getElementById("amc-panel-miscview"));
    amc_init_gearview(document.getElementById("amc-panel-miscview"));
    amc_init_statview(document.getElementById("amc-panel-top-left"));
    amc_init_roomview(document.getElementById("amc-panel-bottom-left"));
    amc_init_tab1view(document.getElementById("amc-panel-tab1view"));
    amc_init_tab2view(document.getElementById("amc-panel-tab2view"));
    amc_init_tab3view(document.getElementById("amc-panel-tab3view"));
    amc_init_btn1view(document.getElementById("amc-panel-btn1view"));
    amc_init_btn2view(document.getElementById("amc-panel-btn2view"));

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
