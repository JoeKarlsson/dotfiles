#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Run Homelab Health Check
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🩺
# @raycast.packageName Homelab

# Documentation:
# @raycast.description Runs the full health-check suite in the background (about 5 min) and sends a notification with the result. Opens a summary of any problems.
# @raycast.author Joe Karlsson

RUN="$HOME/claude-skills/domains/proxmox/scripts/health-checks/run-all.sh"
OUT="$HOME/.health-reports"
LOCK="$OUT/.raycast-run.lock"

[ -x "$RUN" ] || { echo "Health check not found at $RUN"; exit 1; }
mkdir -p "$OUT"
if [ -f "$LOCK" ] && kill -0 "$(cat "$LOCK")" 2>/dev/null; then
  echo "Health check already running"; exit 0
fi

(
  json="$OUT/raycast-latest.json"
  "$RUN" --json > "$json" 2> "$OUT/raycast-latest.err"
  summary=$(/usr/bin/python3 -c '
import json, sys
try:
    d = json.load(open(sys.argv[1]))
except Exception as e:
    print("Health check failed: no report, see ~/.health-reports/raycast-latest.err"); print(0); sys.exit()
s = d["summary"]
# Checks in planned downtime or suppressed by an upstream outage still carry their raw status; skip them like the summary does.
bad = [c for c in d["checks"].values() if c.get("status") not in ("ok", "pass", "suppressed", "skipped")
       and not c.get("downtime") and not c.get("dependency_suppressed")]
score, crit, warn = d["health_score"], s["critical"], s["warnings"]
print(f"Score {score}: {crit} critical, {warn} warnings")
with open(sys.argv[2], "w") as f:
    f.write("Health check %s  score %s\n\n" % (d["timestamp"], score))
    for c in sorted(bad, key=lambda c: c.get("status") != "critical"):
        f.write("[%s] %s: %s\n" % (c.get("status"), c.get("name"), c.get("message")))
    if not bad:
        f.write("All checks passed.\n")
print(len(bad))
' "$json" "$OUT/raycast-latest.txt")
  line=$(echo "$summary" | head -1); nbad=$(echo "$summary" | sed -n 2p)
  /usr/bin/osascript -e "display notification \"$line\" with title \"Homelab health check\" sound name \"Glass\""
  [ "${nbad:-1}" != "0" ] && open -e "$OUT/raycast-latest.txt"
  rm -f "$LOCK"
) >/dev/null 2>&1 &
echo $! > "$LOCK"
disown

echo "Health check started, about 5 min"
