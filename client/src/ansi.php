<?php

$colors = array(
    ":not(.ans-b).ans-fg-black" => array(0, 0, 0),
    ":not(.ans-b).ans-fg-red" => array(128, 0, 0),
    ":not(.ans-b).ans-fg-green" => array(0, 128, 0),
    ":not(.ans-b).ans-fg-yellow" => array(128, 128, 0),
    ":not(.ans-b).ans-fg-blue" => array(0, 0, 128),
    ":not(.ans-b).ans-fg-magenta" => array(128, 0, 128),
    ":not(.ans-b).ans-fg-cyan" => array(0, 128, 128),
    ":not(.ans-b).ans-fg-white" => array(128, 128, 128),
    ".ans-b.ans-fg-black" => array(64, 64, 64),
    ".ans-b.ans-fg-red" => array(255, 0, 0),
    ".ans-b.ans-fg-green" => array(0, 255, 0),
    ".ans-b.ans-fg-yellow" => array(255, 255, 0),
    ".ans-b.ans-fg-blue" => array(0, 0, 255),
    ".ans-b.ans-fg-magenta" => array(255, 0, 255),
    ".ans-b.ans-fg-cyan" => array(0, 255, 255),
    ".ans-b.ans-fg-white" => array(255, 255, 255)
);

$styles = array(
    ".ans-italic"          => array("font-style"       => "italic"         ),
    ".ans-underline"       => array("text-decoration"  => "underline"      ),
    ".ans-faint"           => array("opacity"          => "0.25"           ),
    ".ans-strikethrough"   => array("text-decoration"  => "line-through"   ),
    ".ans-hidden"          => array("color"            => "transparent"    ),
    ".ans-blinked"         => array("color"            => "transparent"    )
);

foreach ($colors as $c => $v) {
    $code = sprintf("#%02X%02X%02X",$v[0], $v[1], $v[2]);
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

foreach ($colors as $c1 => $v1) {
    foreach ($colors as $c2 => $v2) {
        if ($c1 === $c2) {
            continue;
        }

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

foreach ($colors as $c1 => $v1) {
    foreach ($colors as $c2 => $v2) {
        foreach ($colors as $c3 => $v3) {
            if ($c1 === $c2 || $c2 === $c3) {
                continue;
            }

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
