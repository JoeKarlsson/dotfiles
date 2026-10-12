#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Homelab Alerts
# @raycast.mode inline
# @raycast.refreshTime 5m

# Optional parameters:
# @raycast.icon 🚨
# @raycast.packageName Homelab

# Documentation:
# @raycast.description Firing Alertmanager alerts (CT 203), not silenced or inhibited. Watchdog is ignored.
# @raycast.author Joe Karlsson

AM="http://192.168.0.203:9093"
json=$(/usr/bin/curl -s -m 5 "$AM/api/v2/alerts?active=true&silenced=false&inhibited=false") || {
  echo "Alertmanager unreachable (off LAN?)"; exit 0; }

/usr/bin/python3 -c '
import json, sys
alerts = [a for a in json.loads(sys.argv[1]) if a["labels"].get("alertname") != "Watchdog"]
crit = sorted({a["labels"].get("alertname", "?") for a in alerts if a["labels"].get("priority") == "critical"})
other = len(alerts) - sum(a["labels"].get("priority") == "critical" for a in alerts)
if crit:
    print(f"🔴 {len(crit)} critical: " + ", ".join(crit) + (f" (+{other} other)" if other else ""))
elif other:
    print(f"🟡 No critical alerts, {other} non-paging firing")
else:
    print("🟢 All clear")
' "$json"
