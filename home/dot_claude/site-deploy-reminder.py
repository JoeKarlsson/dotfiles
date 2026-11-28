#!/usr/bin/env python3
"""PostToolUse hook on Bash: after a `git push` of joekarlsson.com (or one of its worktrees),
remind Claude the site isn't live until `npm run deploy`.

On 2026-11-27 a session pushed the site five times without deploying, so Joe kept checking the
old site for hours. A hook in the repo itself wouldn't have fired: hooks come from the folder a
session starts in, and that session started in another repo. So this one is user-level and
works out which repo was pushed from the command (`cd <dir>`, `git -C <dir>`) or the shell's cwd.
"""
import json
import os
import re
import shlex
import subprocess
import sys

SITE_REMOTE = re.compile(r"JoeKarlsson/joekarlsson\.com(\.git)?$")
PUSH = re.compile(r"(^|[\s;&|(])git(\s+(-C\s+\S+|-c\s+\S+|-\S+))*\s+push(\s|$)")


def pushed_dir(command: str, cwd: str) -> str:
    """The folder the push ran in: the last `cd` before it or a `git -C`, else the cwd."""
    directory = cwd
    head = command[: PUSH.search(command).start() + 1] if PUSH.search(command) else command
    for match in re.finditer(r"(?:^|[;&|]\s*)cd\s+(\"[^\"]+\"|'[^']+'|[^\s;&|]+)", head):
        directory = os.path.join(directory, os.path.expanduser(shlex.split(match.group(1))[0]))
    git_c = re.search(r"git\s+-C\s+(\"[^\"]+\"|'[^']+'|\S+)\s+(\S+\s+)*push", command)
    if git_c:
        directory = os.path.join(directory, os.path.expanduser(shlex.split(git_c.group(1))[0]))
    return os.path.normpath(directory)


def origin_url(directory: str) -> str:
    # Reads the remote only; never writes config
    env = {k: v for k, v in os.environ.items() if not k.startswith("GIT_")}
    try:
        return subprocess.run(
            ["git", "-C", directory, "remote", "get-url", "origin"],
            capture_output=True, text=True, timeout=5, env=env,
        ).stdout.strip()
    except (OSError, subprocess.TimeoutExpired):
        return ""


def main() -> None:
    event = json.load(sys.stdin)
    command = event.get("tool_input", {}).get("command", "")
    if not PUSH.search(command) or "--dry-run" in command:
        return
    directory = pushed_dir(command, event.get("cwd") or os.getcwd())
    if not SITE_REMOTE.search(origin_url(directory)):
        return
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext": (
        "You pushed joekarlsson.com. It isn't live until `npm run deploy` (the repo's CLAUDE.md: "
        "\"Don't stop at push\"). Run it in the background (it waits for CI), then check the live page, "
        "unless Joe asked you not to ship this yet."
    )}}))


if __name__ == "__main__":
    main()
