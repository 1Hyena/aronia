<?php

$theme = "Arion";

$themes = array(
    "Arion" => array(
        "black"         => "#000000",
        "red"           => "#800000",
        "green"         => "#008000",
        "yellow"        => "#808000",
        "blue"          => "#306090",
        "magenta"       => "#800080",
        "cyan"          => "#008080",
        "white"         => "#aaaaaa",
        "hi-black"      => "#555555",
        "hi-red"        => "#ff0000",
        "hi-green"      => "#00ff00",
        "hi-yellow"     => "#ffff00",
        "hi-blue"       => "#0080ff",
        "hi-magenta"    => "#ff00ff",
        "hi-cyan"       => "#00ffff",
        "hi-white"      => "#ffffff",
        "bg-color"      => "#000000",
        "fg-color"      => "#aaaaaa"
    ),
    "ANSI" => array(
        "black"         => "#000000",
        "red"           => "#800000",
        "green"         => "#008000",
        "yellow"        => "#808000",
        "blue"          => "#000080",
        "magenta"       => "#800080",
        "cyan"          => "#008080",
        "white"         => "#c0c0c0",
        "hi-black"      => "#808080",
        "hi-red"        => "#ff0000",
        "hi-green"      => "#00ff00",
        "hi-yellow"     => "#ffff00",
        "hi-blue"       => "#0000ff",
        "hi-magenta"    => "#ff00ff",
        "hi-cyan"       => "#00ffff",
        "hi-white"      => "#ffffff",
        "bg-color"      => "#000000",
        "fg-color"      => "#c0c0c0"
    ),
    "Aardvark Blue" => array(
        "black"         => "#191919",
        "red"           => "#aa342e",
        "green"         => "#4b8c0f",
        "yellow"        => "#dbba00",
        "blue"          => "#1370d3",
        "magenta"       => "#c43ac3",
        "cyan"          => "#008eb0",
        "white"         => "#bebebe",
        "hi-black"      => "#454545",
        "hi-red"        => "#f05b50",
        "hi-green"      => "#95dc55",
        "hi-yellow"     => "#ffe763",
        "hi-blue"       => "#60a4ec",
        "hi-magenta"    => "#e26be2",
        "hi-cyan"       => "#60b6cb",
        "hi-white"      => "#f7f7f7",
        "bg-color"      => "#102040",
        "fg-color"      => "#dddddd"
    )
);

$colors = array(
    ":not(.ans-b).ans-fg-black"     => "black",
    ":not(.ans-b).ans-fg-red"       => "red",
    ":not(.ans-b).ans-fg-green"     => "green",
    ":not(.ans-b).ans-fg-yellow"    => "yellow",
    ":not(.ans-b).ans-fg-blue"      => "blue",
    ":not(.ans-b).ans-fg-magenta"   => "magenta",
    ":not(.ans-b).ans-fg-cyan"      => "cyan",
    ":not(.ans-b).ans-fg-white"     => "white",
    ".ans-b.ans-fg-black"           => "hi-black",
    ".ans-b.ans-fg-red"             => "hi-red",
    ".ans-b.ans-fg-green"           => "hi-green",
    ".ans-b.ans-fg-yellow"          => "hi-yellow",
    ".ans-b.ans-fg-blue"            => "hi-blue",
    ".ans-b.ans-fg-magenta"         => "hi-magenta",
    ".ans-b.ans-fg-cyan"            => "hi-cyan",
    ".ans-b.ans-fg-white"           => "hi-white"
);

foreach ($colors as $c => $v) {
    if (!is_string($v) || !array_key_exists($v, $themes[$theme])) {
        continue;
    }

    $hex = $themes[$theme][$v];
    list($r, $g, $b) = sscanf($hex, "#%02x%02x%02x");

    $colors[$c] = array(
        "rgb" => array(intval($r), intval($g), intval($b)),
        "lerp" => strcasecmp($themes[$theme]["bg-color"], $hex) ? true : false
    );
}

$styles = array(
    ".ans-default"         => array(
        "color"            => $themes[$theme]["fg-color"],
        "background-color" => $themes[$theme]["bg-color"]
    ),
    ".ans-italic"          => array("font-style"       => "italic"         ),
    ".ans-underline"       => array("text-decoration"  => "underline"      ),
    ".ans-faint"           => array("opacity"          => "0.25"           ),
    ".ans-strikethrough"   => array("text-decoration"  => "line-through"   ),
    ".ans-hidden"          => array("color"            => "transparent"    ),
    ".ans-blinked"         => array("color"            => "transparent"    )
);

foreach ($colors as $c => $v) {
    $code = sprintf("#%02X%02X%02X",$v["rgb"][0], $v["rgb"][1], $v["rgb"][2]);
    $class = $c;

    echo(
        $class." {\n".
        "  color: ".$code.";\n".
        "}\n"
    );
}

foreach ($styles as $class => $properties) {
    echo($class." {\n");

    foreach ($properties as $key => $value) {
        echo(
            "  ".$key.": ".$value.";\n"
        );
    }

    echo("}\n");
}

echo(".ans-lerp {\n");

foreach ($colors as $c1 => $c1v) {
    foreach ($colors as $c2 => $c2v) {
        if ($c1 === $c2
        || !$c1v["lerp"]
        || !$c2v["lerp"]) {
            continue;
        }

        $v1 = $c1v["rgb"];
        $v2 = $c2v["rgb"];

        $v = array(
            floor(($v1[0] + $v2[0]) / 2),
            floor(($v1[1] + $v2[1]) / 2),
            floor(($v1[2] + $v2[2]) / 2)
        );

        $from1 = sprintf("#%02X%02X%02X",$v1[0], $v1[1], $v1[2]);
        $from2 = sprintf("#%02X%02X%02X",$v2[0], $v2[1], $v2[2]);
        $to = sprintf("#%02X%02X%02X",$v[0], $v[1], $v[2]);

        echo(
            "  &".$c1.":has(+ .ans-lerp".$c2.") {\n".
            "    background-image: linear-gradient(\n".
            "      to right, ".$from1.", ".$to."\n".
            "    );\n".
            "    color: transparent;\n".
            "  }\n"
        );

        echo(
            "  &".$c1." + .ans-lerp".$c2." {\n".
            "    background-image: linear-gradient(\n".
            "      to right, ".$to.", ".$from2."\n".
            "    );\n".
            "    color: transparent;\n".
            "  }\n"
        );
    }
}

foreach ($colors as $c1 => $c1v) {
    foreach ($colors as $c2 => $c2v) {
        foreach ($colors as $c3 => $c3v) {
            if ($c1 === $c2 || $c2 === $c3) {
                continue;
            }

            if (!$c1v["lerp"] || !$c2v["lerp"] || !$c3v["lerp"]) {
                continue;
            }

            $v1 = $c1v["rgb"];
            $v2 = $c2v["rgb"];
            $v3 = $c3v["rgb"];

            $vl = array(
                floor(($v1[0] + $v2[0]) / 2),
                floor(($v1[1] + $v2[1]) / 2),
                floor(($v1[2] + $v2[2]) / 2)
            );

            $vr = array(
                floor(($v3[0] + $v2[0]) / 2),
                floor(($v3[1] + $v2[1]) / 2),
                floor(($v3[2] + $v2[2]) / 2)
            );

            $cl = sprintf("#%02X%02X%02X",$vl[0], $vl[1], $vl[2]);
            $cr = sprintf("#%02X%02X%02X",$vr[0], $vr[1], $vr[2]);
            $cc = sprintf("#%02X%02X%02X",$v2[0], $v2[1], $v2[2]);

            echo(
                "  &".$c1." + ".$c2.
                ".ans-lerp:has(+ .ans-lerp".$c3.") {\n".
                "    background-image: linear-gradient(\n".
                "      to right, ".$cl.", ".$cc.", ".$cr."\n".
                "    );\n".
                "    color: transparent;\n".
                "  }\n"
            );
        }
    }
}

echo(
    "  background-clip: text;\n".
    "}\n"
);
