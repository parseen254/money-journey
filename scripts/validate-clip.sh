#!/usr/bin/env bash
# Describe a video clip with Gemini and flag physical/continuity errors that
# single-frame review misses (hand-offs, morphs, floating objects, wrong motion).
# Usage: scripts/validate-clip.sh clips/clip-4.mp4 ["extra question"]
set -euo pipefail
cd "$(dirname "$0")/.."
F="${1:?usage: validate-clip.sh <clip.mp4> [question]}"
Q="${2:-}"
KEY="${GEMINI_API_KEY:-$(grep -oE 'GEMINI_API_KEY=[A-Za-z0-9_-]+' ~/.zshrc ~/Documents/SecondBrain/.env 2>/dev/null | head -1 | cut -d= -f2)}"
[ -n "$KEY" ] || { echo "no GEMINI_API_KEY"; exit 1; }
MIME=video/mp4; SZ=$(wc -c < "$F" | tr -d ' ')

UP=$(curl -s -X POST "https://generativelanguage.googleapis.com/upload/v1beta/files?key=$KEY" -D - \
  -H "X-Goog-Upload-Protocol: resumable" -H "X-Goog-Upload-Command: start" \
  -H "X-Goog-Upload-Header-Content-Length: $SZ" -H "X-Goog-Upload-Header-Content-Type: $MIME" \
  -H "Content-Type: application/json" -d "{\"file\":{\"display_name\":\"$(basename "$F")\"}}")
URL=$(echo "$UP" | grep -i "x-goog-upload-url:" | sed 's/.*: //' | tr -d '\r')
[ -n "$URL" ] || { echo "no upload url"; exit 1; }
FILE=$(curl -s -X POST "$URL" -H "Content-Length: $SZ" -H "X-Goog-Upload-Offset: 0" \
  -H "X-Goog-Upload-Command: upload, finalize" --data-binary @"$F")
URI=$(echo "$FILE" | python3 -c "import json,sys;print(json.load(sys.stdin)['file']['uri'])")
NAME=$(echo "$FILE" | python3 -c "import json,sys;print(json.load(sys.stdin)['file']['name'])")

# poll until ACTIVE
for i in $(seq 1 30); do
  ST=$(curl -s "https://generativelanguage.googleapis.com/v1beta/$NAME?key=$KEY" | python3 -c "import json,sys;print(json.load(sys.stdin).get('state','?'))")
  [ "$ST" = "ACTIVE" ] && break
  sleep 2
done

PROMPT="You are a strict film-continuity and physics checker reviewing an 8-second AI-generated video clip. Describe what happens in 2-3 short sentences, then list any PHYSICAL IMPOSSIBILITIES or CONTINUITY ERRORS: objects morphing/changing shape, objects floating or moving on their own, extra hands or a hand-off to a second person when it should be one person, garbled/nonsense text, impossible mechanics (e.g. a balance scale tipping the wrong way), or anything that reads as fake CGI. If none, say 'CLEAN'. Be blunt and specific. ${Q}"

REQ=$(python3 -c "
import json,sys
uri='$URI'; prompt='''$PROMPT'''
print(json.dumps({'contents':[{'parts':[{'file_data':{'mime_type':'$MIME','file_uri':uri}},{'text':prompt}]}]}))
")
curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=$KEY" \
  -H "Content-Type: application/json" -d "$REQ" | \
  python3 -c "import json,sys; d=json.load(sys.stdin); print(d['candidates'][0]['content']['parts'][0]['text']) if 'candidates' in d else print('ERR:', json.dumps(d)[:400])"

# cleanup uploaded file
curl -s -X DELETE "https://generativelanguage.googleapis.com/v1beta/$NAME?key=$KEY" >/dev/null 2>&1 || true
