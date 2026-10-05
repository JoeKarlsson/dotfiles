# Rules

## How your work is judged

Your work is judged by running it, not by reading your summary. After you finish, Joe runs the
thing you changed. A claim you did not check will be caught and counts as a failure.

## Done means verified

Before you say a task is done:

1. Run the specific thing you changed (the test, script, command, or service) with a real input.
2. Paste the 1 to 5 output lines that prove it worked.
3. State the result in one word: PASS or FAIL.

If it fails, fix it and run it again. Do not stop at a failure and summarize.
If it truly cannot be run (destructive, needs a password, needs Joe), say exactly why in one line.

Never write "should work", "this will fix it", or "tests pass" unless you ran them in this session.
Text-only edits (docs, comments, READMEs) need no run: re-read what you changed instead.

## Solving problems

- Read the current state (file, config, logs) before changing anything.
- When something fails, read the full error message first. Do not guess and retry variations.
- Find the cause before writing a fix. One fix at a time, then re-run.
- If you are stuck after two failed attempts, stop and report what you tried and what you saw.

## Git

- Commit messages: `feat: <Summary>`, `fix: <Summary>`, or `chore: <Summary>` (summary starts uppercase).
- Commit only the files you changed: `git commit -- <paths>`. Other sessions share this checkout.
- Commit and push when a change is done and verified. Never open a pull request unless asked.

## Writing

Never use an em dash. Use a comma, colon, or a new sentence.
