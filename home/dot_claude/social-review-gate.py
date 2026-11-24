#!/usr/bin/env python3
"""Stop hook: no turn ends with a changed social draft that the reader-reviewer hasn't read.

Joe, 2026-11-24: four rewrites of one thread buried the lead, and /social's own step
("run the reader-reviewer on the first draft and any rewrite of the opener") was skipped every
time. Rules in a file get skipped; this blocks the stop instead. It reads the session transcript,
finds the last tool call that wrote a draft in drafts/social/, and blocks unless an Agent call
to reader-reviewer comes after it.
"""
import json
import re
import sys

DRAFT = re.compile(r'drafts/social/(?:work/)?[^/\s"\']+\.md\b(?!\.approved)')
SHELL_WRITE = re.compile(r'sed -i|>\s*\S*drafts/social/|\bmv\b|\bcp\b|\btee\b|write_text')


def writes_draft(block):
    name, args = block.get('name'), block.get('input') or {}
    if name in ('Write', 'Edit'):
        return bool(DRAFT.search(args.get('file_path', '')))
    if name == 'Bash':
        command = args.get('command', '')
        return bool(DRAFT.search(command) and SHELL_WRITE.search(command))
    return False


def is_reader_review(block):
    return block.get('name') == 'Agent' and (block.get('input') or {}).get('subagent_type') == 'reader-reviewer'


def unreviewed(transcript_lines):
    last_write = last_review = -1
    for i, line in enumerate(transcript_lines):
        try:
            entry = json.loads(line)
        except ValueError:
            continue
        content = (entry.get('message') or {}).get('content')
        if entry.get('type') != 'assistant' or not isinstance(content, list):
            continue
        for block in content:
            if block.get('type') != 'tool_use':
                continue
            if writes_draft(block):
                last_write = i
            elif is_reader_review(block):
                last_review = i
    return last_write > last_review


def main():
    event = json.load(sys.stdin)
    if event.get('stop_hook_active'):
        return
    try:
        with open(event['transcript_path']) as f:
            lines = f.readlines()
    except (KeyError, OSError):
        return
    if unreviewed(lines):
        print(json.dumps({
            'decision': 'block',
            'reason': 'A social draft changed and the reader-reviewer has not read it since. Run the '
                      'reader-reviewer agent on it now (/social Step 3), checking that post 1 opens on the '
                      "surprising finding a stranger understands, then Joe's take on why, with Joe never "
                      'the hook. Fix what it finds before showing Joe.',
        }))


if __name__ == '__main__':
    main()
