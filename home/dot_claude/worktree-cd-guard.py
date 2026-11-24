#!/usr/bin/env python3
"""PreToolUse hook on Bash: in a session isolated to a .claude/worktrees/<name> worktree,
refuse any `cd` or `pushd` into the repo's shared checkout outside that worktree.

Why: the cd succeeds, the shell stays there, and Claude Code's worktree guard then refuses
every later command, including `cd` back and `!` commands (2026-11-24, bechdel-test).
The only way out is EnterWorktree with the worktree's path. Absolute paths and `git -C`
reach the shared checkout without moving the shell.
"""
import json
import os
import re
import shlex
import sys

MARKER = '/.claude/worktrees/'


def targets(command):
	"""The directories a command cd's or pushd's into, as written."""
	for match in re.finditer(r'(?:^|[;&|(\n]|\bthen|\bdo)\s*(?:cd|pushd)(?:\s+([^;&|)\n]+))?', command):
		arg = (match.group(1) or '').strip()
		try:
			words = shlex.split(arg) if arg else []
		except ValueError:
			words = arg.split()
		words = [w for w in words if not w.startswith('-')]
		yield words[0] if words else '~'


def main():
	payload = json.load(sys.stdin)
	cwd = payload.get('cwd') or os.getcwd()
	if MARKER not in cwd:
		return
	repo, rest = cwd.split(MARKER, 1)
	worktree = repo + MARKER + rest.split('/', 1)[0]
	here = cwd  # each cd moves on from where the one before it left the shell
	for target in targets(payload.get('tool_input', {}).get('command', '')):
		if '$' in target or '`' in target:
			return  # can't resolve variables or command substitution, so later cds are unknown too
		path = os.path.normpath(os.path.join(here, os.path.expanduser(target)))
		here = path
		inside_repo = path == repo or path.startswith(repo + '/')
		inside_worktree = path == worktree or path.startswith(worktree + '/')
		if inside_repo and not inside_worktree:
			print(json.dumps({'hookSpecificOutput': {
				'hookEventName': 'PreToolUse',
				'permissionDecision': 'deny',
				'permissionDecisionReason': (
					f'This session is isolated to {worktree}. `cd {target}` would move the shell into the shared '
					'checkout, and the worktree guard would then refuse every later command. Use absolute paths, '
					'`git -C <path>`, or a subshell-free command that names the file directly.'),
			}}))
			return


main()
