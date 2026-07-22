#!/usr/bin/env bash
# Assemble the six Flow/Veo era clips into the final 60fps scroll film.
# Usage: scripts/assemble-film.sh            (expects clips/clip-1.mp4 .. clip-6.mp4)
#        scripts/assemble-film.sh --fast     (skip minterpolate, plain 60fps blend — quick preview)
set -euo pipefail
cd "$(dirname "$0")/.."

for i in 1 2 3 4 5 6; do
  [[ -f "clips/clip-$i.mp4" ]] || { echo "missing clips/clip-$i.mp4"; exit 1; }
done

mkdir -p build public/media

# Re-encode each clip to identical params so concat is seam-exact (no -c copy: Veo
# clips can differ in timebase, which desyncs the scrub timeline).
for i in 1 2 3 4 5 6; do
  ffmpeg -y -v error -i "clips/clip-$i.mp4" \
    -vf "scale=1920:1080:flags=lanczos,fps=24" \
    -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -an "build/norm-$i.mp4"
done

printf "file 'norm-%d.mp4'\n" 1 2 3 4 5 6 > build/concat.txt
ffmpeg -y -v error -f concat -safe 0 -i build/concat.txt -c copy build/journey-24.mp4

if [[ "${1:-}" == "--fast" ]]; then
  ffmpeg -y -v error -i build/journey-24.mp4 -vf "fps=60" \
    -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -movflags +faststart -an \
    public/media/journey.mp4
else
  ffmpeg -y -i build/journey-24.mp4 \
    -vf "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:vsbmc=1" \
    -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart -an \
    public/media/journey.mp4
fi

ffprobe -v error -show_entries format=duration -of csv=p=0 public/media/journey.mp4 |
  xargs printf "journey.mp4 assembled: %ss\n"