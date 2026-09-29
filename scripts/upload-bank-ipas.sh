#!/usr/bin/env bash
# Upload bank soal IPAS (file penuh atau chunks) ke siswacerdas/kuis
# Wajib: export GITHUB_TOKEN=ghp_...
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
UPLOAD="$DIR/upload-github-file.sh"
ROOT="$(cd "$DIR/.." && pwd)"

FULL="$ROOT/bank-soal/ipas-ganjil-2026.json"
if [[ -f "$FULL" ]]; then
  N=$(python3 -c "import json; d=json.load(open('$FULL')); print(len(d.get('soal',[])))" 2>/dev/null || echo 0)
  if [[ "$N" -gt 50 ]]; then
    "$UPLOAD" siswacerdas/kuis bank-soal/ipas-ganjil-2026-full.json "$FULL" main "feat(latihan): bank soal IPAS penuh ($N soal)"
  fi
fi

if [[ -d "$ROOT/bank-soal/ipas" ]]; then
  for f in "$ROOT/bank-soal/ipas"/*.json; do
    [[ -f "$f" ]] || continue
    base=$(basename "$f")
    "$UPLOAD" siswacerdas/kuis "bank-soal/ipas/$base" "$f" main "feat(latihan): bank soal IPAS — $base"
  done
fi
echo "Selesai."
