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

## Evidence, not inference

- A claim about behavior ("the scan fixes the path", "the move keeps the metadata") must come
  from running it this session, with the output pasted. Reading docs, or one observation, is
  not evidence.
- For anything asynchronous (a scan, job, queue, deploy, cron), poll it to completion, then
  verify the end result. "It started" is not "it worked".
- Verify the effect a user would actually see, not an intermediate signal. If the claim is
  "the video still plays", fetch the stream and show the bytes. If it is "the metadata
  survives", dump the rows before and after.
- Watch for confounds: identical fixtures, reused ids, cached state, a URL built wrong. If a
  result could have another cause, say so and re-run it cleanly.
- State what you are uncertain about, and what you did not test. Never present an inference
  as a verified fact, and never report a task done while an open question would change the
  answer.

## Reversible by default

- Anything that mutates state (moves, renames, deletes, database writes) defaults to a dry
  run and applies only on an explicit go-ahead.
- Record an audit log of every mutation (what, from, to, ids, a fingerprint) so it can be
  checked and reversed.
- Prove the mutation on a throwaway fixture first, then clean the fixture up and say you did.

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
