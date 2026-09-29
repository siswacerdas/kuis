#!/usr/bin/env bash
# Upload a local file to GitHub repo (create or update) via Contents API.
# Usage:
#   export GITHUB_TOKEN=ghp_xxxx   # PAT with contents:write
#   ./upload-github-file.sh owner/repo path/in/repo local/file [branch] [message]
#
# Example:
#   ./upload-github-file.sh siswacerdas/kuis bank-soal/ipas/cahaya-1.json ./cahaya-1.json

set -euo pipefail

REPO="${1:?usage: owner/repo path localfile [branch] [message]}"
REMOTE_PATH="${2:?}"
LOCAL_FILE="${3:?}"
BRANCH="${4:-main}"
MESSAGE="${5:-chore: upload $REMOTE_PATH}"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Error: set GITHUB_TOKEN (PAT with contents:write)" >&2
  exit 1
fi
if [[ ! -f "$LOCAL_FILE" ]]; then
  echo "Error: file not found: $LOCAL_FILE" >&2
  exit 1
fi

OWNER="${REPO%%/*}"
NAME="${REPO##*/}"
API="https://api.github.com/repos/${OWNER}/${NAME}/contents/${REMOTE_PATH}"

SHA=$(curl -sS -H "Authorization: Bearer ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" \
  "${API}?ref=${BRANCH}" 2>/dev/null | python3 -c "import sys,json
try:
  d=json.load(sys.stdin); print(d.get('sha') or '')
except Exception:
  print('')" || true)

python3 - "$API" "$BRANCH" "$MESSAGE" "$LOCAL_FILE" "$SHA" << 'PY'
import sys, json, base64, urllib.request, os

api, branch, message, local_file, sha = sys.argv[1:6]
with open(local_file, "rb") as f:
    content_b64 = base64.b64encode(f.read()).decode("ascii")

body = {"message": message, "content": content_b64, "branch": branch}
if sha:
    body["sha"] = sha

req = urllib.request.Request(
    api,
    data=json.dumps(body).encode("utf-8"),
    method="PUT",
    headers={
        "Authorization": "Bearer " + os.environ["GITHUB_TOKEN"],
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
    },
)
try:
    with urllib.request.urlopen(req) as resp:
        d = json.load(resp)
        print("OK", d["content"]["path"], "commit", d["commit"]["sha"][:7])
except urllib.error.HTTPError as e:
    err = e.read().decode()
    print("ERROR", e.code, err[:500], file=sys.stderr)
    sys.exit(1)
PY
