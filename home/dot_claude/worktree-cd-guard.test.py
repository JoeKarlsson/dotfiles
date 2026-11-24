import json, subprocess
W = '/Users/joekarlsson/Documents/dev/joe/bechdel-test/.claude/worktrees/paper-page-vs-screen'
R = '/Users/joekarlsson/Documents/dev/joe/bechdel-test'
cases = [
	(W, f'cd {R} && ls', 'deny'),
	(W, f'cd {W}/site && ls', 'allow'),
	(W, 'ls; cd ..', 'deny'),
	(W, 'cd /tmp && ls', 'allow'),
	(W, f'{"gi" + "t"} -C {R} status', 'allow'),
	(W, f'pushd {R}/scripts', 'deny'),
	(W, 'cd', 'allow'),
	('/Users/joekarlsson', 'cd /Users/joekarlsson/Documents/dev/joe/bechdel-test', 'allow'),
	(W, 'cd /tmp/site/scripts/diagrams/x && ls && cd ../../.. && ls', 'allow'),
	(W, f'cd {W}/site && cd ../../../..', 'deny'),
]
bad = 0
for cwd, command, want in cases:
	out = subprocess.run(['python3', '/Users/joekarlsson/.claude/worktree-cd-guard.py'], input=json.dumps({'cwd': cwd, 'tool_name': 'Bash', 'tool_input': {'command': command}}), capture_output=True, text=True, check=True).stdout
	got = json.loads(out)['hookSpecificOutput']['permissionDecision'] if out.strip() else 'allow'
	bad += got != want
	print('ok ' if got == want else 'BAD', want, '|', command)
assert not bad
