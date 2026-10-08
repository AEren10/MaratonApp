#!/usr/bin/env bash
# Kullanım: bash render.sh  -> out/ios/*.png, out/android/*.png
set -e
cd "$(dirname "$0")"
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
DIR=$(cygpath -m "$PWD")
declare -A SIZE=([ios]="1320,2868" [android]="1440,2560")
for p in ios android; do
  mkdir -p out/$p
  for s in 01 02 03 04 05 06 07 08; do
    "$EDGE" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
      --allow-file-access-from-files --virtual-time-budget=4000 \
      --window-size=${SIZE[$p]} --screenshot="$DIR/out/$p/$s.png" \
      "file:///$DIR/frame.html?p=$p&s=$s" >/dev/null 2>&1
    echo "out/$p/$s.png"
  done
done
