import json, subprocess
S = '/Users/joekarlsson/Documents/dev/joe/joekarlsson.com'
O = '/Users/joekarlsson/Documents/dev/joe/screencast-director'
P = 'pu' + 'sh'
cases = [
	(S, f'git {P} -q', True),
	(O, f'cd {S} && git pull --rebase && git {P}', True),
	(O, f'git -C {S} {P} origin HEAD:main', True),
	(O, f'git {P}', False),
	(S, f'git {P} --dry-run', False),
	(S, 'git status', False),
]
bad = 0
for cwd, command, want in cases:
	out = subprocess.run(['python3', '/Users/joekarlsson/.claude/site-deploy-reminder.py'], input=json.dumps({'cwd': cwd, 'tool_name': 'Bash', 'tool_input': {'command': command}}), capture_output=True, text=True, check=True).stdout
	got = 'npm run deploy' in out
	bad += got != want
	print('ok ' if got == want else 'BAD', want, '|', command)
assert not bad
