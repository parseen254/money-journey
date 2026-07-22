#!/usr/bin/env bash
# Extract six loop-ready era audio beds from clips/clip-1.mp4 through clips/clip-6.mp4.

set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
output_dir="$project_root/public/media/audio"
mkdir -p "$output_dir"

for era in {1..6}; do
  input="$project_root/clips/clip-$era.mp4"
  output="$output_dir/era-$era.m4a"

  if [[ ! -f "$input" ]]; then
    printf 'Missing input clip: %s\n' "$input" >&2
    exit 1
  fi

  duration="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$input")"
  fade_out_start="$(awk -v duration="$duration" 'BEGIN { start = duration - 0.5; if (start < 0) start = 0; printf "%.3f", start }')"

  ffmpeg -y -i "$input" \
    -vn \
    -af "afade=t=in:st=0:d=0.5,afade=t=out:st=${fade_out_start}:d=0.5" \
    -c:a aac \
    -b:a 128k \
    "$output"
done
