#!/bin/bash

if [ ! $(which "cwebp" 2>/dev/null ) ] ; then
    printf "%s\n" "Program not found: cwebp"
    exit
fi

if [ ! $(which "grep" 2>/dev/null ) ] ; then
    printf "%s\n" "Program not found: grep"
    exit
fi

dir=${1:-./src/}
src=${2:-amc.html}
out=${3:-./index.html}

> "$out"
met_src=false
ext_src=false
ext_min=false
ext_css=false
ext_sfx=false
ext_gfx=false
met_array=
src_array=
min_array=
css_array=
sfx_array=
gfx_array=
tsize=0

printf "Reading %s and writing %s.\n" "${dir}${src}" "${out}"

while IFS='' read -r line || [[ -n "$line" ]]; do
    if [ "$line" == "/*** INJECT COMPILER INFO HERE ***/" ]; then
        timestamp=$(date +%s)
        printf "var COMPILE_TIME='%s';\n" "${timestamp}" >> "$out"
        continue
    fi

    if [ "$line" == "/* PASTE EXTERNAL CSS HERE */" ]; then
        files=""

        for file in "${css_array[@]}"
        do
            if [ -z "$file" ]; then
                continue
            else
                if [ -f "$file" ]; then
                    files="${files}${file} "
                else
                    echo "External CSS '$file' does not exist."
                fi
            fi
        done

        printf "Compiling: %s\n" "${files}"
        java -jar ./bin/closure-stylesheets.jar \
            --allow-unrecognized-properties \
            --allowed-non-standard-function MIN \
            --allowed-non-standard-function MAX ${files} >> "$out"
        printf "\n" >> "${out}"
        continue
    fi

    if [ "$line" == "<!-- PASTE EXTERNAL JS HERE -->" ]; then
        files=""

        for file in "${src_array[@]}"
        do
            if [ -z "$file" ]; then
                continue
            else
                if [ -f "$file" ]; then
                    files="${files}${file} "
                else
                    echo "External javascript '$file' does not exist."
                fi
            fi
        done

        printf "<script>\n" >> "$out"
        printf "Compiling: %s\n" "${files}"
        java -jar ./bin/closure-compiler.jar --hide_warnings_for '/lib/' ${files} \
            >> "$out"
        printf "\n</script>\n" >> "$out"
        continue
    fi

    if [ "$line" == "<!-- PASTE MINIFIED EXTERNAL JS HERE -->" ]; then
        files=""

        printf "<script>\n" >> "$out"

        for file in "${min_array[@]}"
        do
            if [ -z "$file" ]; then
                continue
            else
                if [ -f "$file" ]; then
                    files="${files}${file} "
                    cat ${file} <(echo) >> "$out"
                else
                    echo "Minified external javascript '$file' does not exist."
                fi
            fi
        done

        printf "Concatenated: %s\n" "${files}"
        printf "\n</script>\n" >> "$out"

        continue
    fi

    if [ "$line" == "<!-- PASTE META JS HERE -->" ]; then
        files=""

        for file in "${met_array[@]}"
        do
            if [ -z "$file" ]; then
                continue
            else
                if [ -f "$file" ]; then
                    files="${files}${file} "
                else
                    echo "Meta javascript '$file' does not exist."
                fi
            fi
        done

        printf "<script>\n" >> "$out"
        printf "Compiling: %s\n" "${files}"
        java -jar ./bin/closure-compiler.jar ${files} >> "$out"
        printf "\n</script>\n" >> "$out"
        continue
    fi

    if [ "$line" == "<!-- BEGIN EXTERNAL CSS -->" ]; then
        ext_css=true
        continue
    fi

    if [ "$line" == "<!-- END EXTERNAL CSS -->" ]; then
        ext_css=false
        continue
    fi

    if [ "$line" == "<!-- BEGIN EXTERNAL SCRIPTS -->" ]; then
        ext_src=true
        continue
    fi

    if [ "$line" == "<!-- END EXTERNAL SCRIPTS -->" ]; then
        ext_src=false
        continue
    fi

    if [ "$line" == "<!-- BEGIN MINIFIED EXTERNAL SCRIPTS -->" ]; then
        min_src=true
        continue
    fi

    if [ "$line" == "<!-- END MINIFIED EXTERNAL SCRIPTS -->" ]; then
        min_src=false
        continue
    fi

    if [ "$line" == "<!-- BEGIN META SCRIPTS -->" ]; then
        met_src=true
        continue
    fi

    if [ "$line" == "<!-- END META SCRIPTS -->" ]; then
        met_src=false
        continue
    fi

    if [ "$line" == "<!-- BEGIN EXTERNAL SFX -->" ]; then
        ext_sfx=true
        continue
    fi

    if [ "$line" == "<!-- BEGIN EXTERNAL GFX -->" ]; then
        ext_gfx=true
        continue
    fi

    if [ "$line" == "<!-- END EXTERNAL SFX -->" ]; then
        ext_sfx=false
        continue
    fi

    if [ "$line" == "<!-- END EXTERNAL GFX -->" ]; then
        ext_gfx=false
        continue
    fi

    if [ "$line" == "<!-- INLINE RESOURCES HERE -->" ]; then
        for gfx in "${gfx_array[@]}"
        do
            if [ -z "$gfx" ]; then
                continue
            fi

            file=$(echo "$gfx" | cut "-d " -f2)

            if [ -f "$file" ]; then
                id=$(echo "$gfx" | cut "-d " -f1)
                rows=$(echo "$gfx" | cut "-d " -f3)

                fname=$(basename $file)
                mimetype=$(file --brief --mime-type "${file}")
                fsize=$(stat --printf="%s" "${file}")

                if [ "$mimetype" == "image/png" ]; then
                    err=$(
                        cwebp -quiet -alpha_q 100 -jpeg_like "${file}" -o - \
                        2>&1 > /dev/null
                    )

                    if [ ! -z "$err" ]; then
                        printf "\033[0;31mConverting %s:\033[0m\n" "${file}"
                    fi

                    b64=$(
                        cwebp -quiet -alpha_q 100 -jpeg_like "${file}" -o - |
                        base64 --wrap=0
                    )

                    mimetype="image/webp"
                else
                    b64=$(base64 --wrap=0 "${file}")
                fi

                printf "%s" "<script>meta_show_progress(" >> "$out"
                printf "'%s','%s'," "${fname}" "${fsize}" >> "$out"
                printf "'%s'" "${tsize}" >> "$out"
                printf "%s\n" ");</script>" >> "$out"
                printf "<img id='%s' " "${id}" >> "$out"
                printf "%s" "onload='meta_resource_loaded(" >> "$out"
                printf "this.id);' data-fsize='%s' " "${fsize}" >> "$out"
                printf "src='data:%s;base64," "${mimetype}" >> "$out"
                printf "%s' data-src='%s' " "${b64}" "${file}" >> "$out"

                if [ ! -z "${rows}" ]; then
                    printf "data-rows='%s' alt=''>\n" "${rows}" >> "$out"
                else
                    printf "%s\n" "alt=''>" >> "$out"
                fi
            else
                echo "External GFX '$file' ($id) does not exist."
            fi
        done
        gfx_array=

        for sfx in "${sfx_array[@]}"
        do
            id=$(echo "$sfx" | cut "-d " -f1)
            file=$(echo "$sfx" | cut "-d " -f2)

            if [ -z "$file" ]; then
                continue
            fi

            if [ -f "$file" ]; then
                fname=$(basename $file)
                b64=$(base64 --wrap=0 "${file}")
                mimetype=$(file --brief --mime-type "${file}")
                fsize=$(stat --printf="%s" "${file}")
                printf "%s" "<script>meta_show_progress(" >> "$out"
                printf "'%s','%s'," "${fname}" "${fsize}" >> "$out"
                printf "'%s');</script>\n" "${tsize}" >> "$out"
                printf "<audio id='%s' oncanplaythrough='" "${id}" >> "$out"
                printf "%s" "meta_resource_loaded(this.id);' " >> "$out"
                printf "data-fsize='%s' " "${fsize}" >> "$out"
                printf "src='data:%s;base64," "${mimetype}" >> "$out"
                printf "%s'></audio>\n" "${b64}" >> "$out"
            else
                echo "External SFX '$file' ($id) does not exist."
            fi
        done
        sfx_array=

        continue
    fi

    if [ "$ext_css" = true ] ; then
        file=$(grep -oPm1 "href='\K[^']+|href=\"\K[^\"]+" <<< "${line}")

        if [ ! -z "$file" ]; then
            css_array+=("${dir}$file")
        fi

        continue
    fi

    if [ "$ext_src" = true ] ; then
        file=$(grep -oPm1 "src='\K[^']+|src=\"\K[^\"]+" <<< "${line}")

        if [ ! -z "$file" ]; then
            src_array+=("${dir}$file")
        fi

        continue
    fi

    if [ "$min_src" = true ] ; then
        file=$(grep -oPm1 "src='\K[^']+|src=\"\K[^\"]+" <<< "${line}")

        if [ ! -z "$file" ]; then
            min_array+=("${dir}$file")
        fi

        continue
    fi

    if [ "$met_src" = true ] ; then
        file=$(grep -oPm1 "src='\K[^']+|src=\"\K[^\"]+" <<< "${line}")

        if [ ! -z "$file" ]; then
            met_array+=("${dir}$file")
        fi

        continue
    fi

    if [ "$ext_sfx" = true ] ; then
        id=$(grep -oPm1 "id='\K[^']+|id=\"\K[^\"]+" <<< "${line}")
        file=$(grep -oPm1 "src='\K[^']+|src=\"\K[^\"]+" <<< "${line}")

        if [ ! -z "$file" ]; then
            sfx_array+=("$id ${dir}$file")
            fsize=$(stat --printf="%s" "${dir}${file}")
            tsize=$(expr ${fsize} + ${tsize})
        fi

        continue
    fi

    if [ "$ext_gfx" = true ] ; then
        id=$(grep -oPm1 "id='\K[^']+|id=\"\K[^\"]+" <<< "${line}")
        file=$(grep -oPm1 "src='\K[^']+|src=\"\K[^\"]+" <<< "${line}")
        rows=$(
            grep -oPm1 "data-rows='\K[^']+|data-rows=\"\K[^\"]+" <<< "${line}"
        )

        if [ ! -z "$file" ]; then
            gfx_array+=("$id ${dir}$file ${rows}")
            fsize=$(stat --printf="%s" "${dir}${file}")
            tsize=$(expr ${fsize} + ${tsize})
        fi

        continue
    fi

    echo "$line" >> "$out"
done < "${dir}${src}"
