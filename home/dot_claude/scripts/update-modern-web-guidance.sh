#!/usr/bin/env bash
# Refresh the local copy of Google's Modern Web Guidance (github.com/GoogleChrome/modern-web-guidance).
# Keeps only the markdown guides plus an INDEX.md built from the package's guide list; none of
# the package's code (search, legacy-scan) is kept or run, so agents read the guides as files.
set -euo pipefail

version="${1:-latest}"
destination="$HOME/.claude/vendor/modern-web-guidance"
download_dir="$(mktemp -d)"
trap 'rm -rf "$download_dir"' EXIT

(cd "$download_dir" && npm pack "modern-web-guidance@$version" --ignore-scripts --silent >/dev/null)
mkdir "$download_dir/package-files"
tar -xzf "$download_dir"/modern-web-guidance-*.tgz -C "$download_dir/package-files"
skill_dir="$download_dir/package-files/package/skills/modern-web-guidance"

rm -rf "$destination.new"
mkdir -p "$destination.new"
cp -R "$skill_dir/guides" "$destination.new/guides"
cp "$skill_dir/SKILL.md" "$destination.new/SKILL.md"

python3 -I - "$skill_dir/gen/guides.json" "$destination.new" "$(cat "$skill_dir/skill-version.txt")" <<'PY'
import json, os, sys
guide_list_path, destination, skill_version = sys.argv[1:4]
guides = json.load(open(guide_list_path))
paths = {}
for root, _, files in os.walk(os.path.join(destination, "guides")):
    for name in files:
        if name.endswith(".md"):
            paths[name[:-3]] = os.path.relpath(os.path.join(root, name), destination)
lines = [
    "# Modern Web Guidance index",
    "",
    f"Skill version {skill_version}. One line per guide: path, approximate tokens, what it covers.",
    "Read the discipline guide for an area first (accessibility, html, css, css-layout, performance,",
    "security, privacy, forms, motion, color, typography, dark-mode), then the specific ones that match.",
    "",
]
missing = []
for category in sorted({g["category"] for g in guides}):
    lines.append(f"## {category}")
    lines.append("")
    for guide in sorted((g for g in guides if g["category"] == category), key=lambda g: g["id"]):
        path = paths.get(guide["id"])
        if path is None:
            missing.append(guide["id"])
            continue
        lines.append(f"- `{path}` (~{guide['tokenCount']} tokens): {guide['description']}")
    lines.append("")
if missing:
    sys.exit(f"guides.json lists guides with no markdown file: {', '.join(missing)}")
open(os.path.join(destination, "INDEX.md"), "w").write("\n".join(lines))
print(f"{len(guides)} guides indexed")
PY

# Google's legacy-scan ships its rules inside a minified bundle; copy out each rule's summary
# and keep/drop rubric as text, so a reviewer can apply them with grep instead of running it.
python3 -I - "$skill_dir/legacy-scan.mjs" "$destination.new/LEGACY-RULES.md" <<'PY'
import re, sys
bundle_path, output_path = sys.argv[1:3]
bundle = open(bundle_path).read()
rules, seen = [], set()
for match in re.finditer(r'guideId:"([a-z0-9-]+)",guideHash:[^,]+,summary:', bundle):
    guide_id = match.group(1)
    if guide_id in seen:
        continue
    seen.add(guide_id)
    rest = bundle[match.end():match.end() + 4000]
    summary = rest[1:rest.find(",matcher:") - 1]
    rubric_start = rest.find("verifierRubric:")
    rubric = rest[rubric_start + len("verifierRubric:"):rest.find("]}}", rubric_start) + 2] if rubric_start >= 0 else "(no rubric)"
    rules.append(f"## {guide_id}\n\n{summary}\n\nRubric: {rubric}\n")
if len(rules) < 10:
    sys.exit(f"found only {len(rules)} legacy rules; the bundle format changed, update this extractor")
header = ("# Legacy-scan rules\n\nThe patterns Google's `legacy-scan` flags, one per guide, with its keepWhen/dropWhen "
          "rubric for telling a real finding from a fallback. Grep the source for each pattern, then read the guide.\n\n")
open(output_path, "w").write(header + "\n".join(rules))
print(f"{len(rules)} legacy rules extracted")
PY

rm -rf "$destination"
mv "$destination.new" "$destination"
echo "Modern Web Guidance $(grep -o '[0-9_]*-[0-9a-f]*' "$skill_dir/skill-version.txt") in $destination"
