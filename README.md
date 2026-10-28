# dotfiles

My dotfiles, managed with [chezmoi](https://chezmoi.io). One repo for every
machine: the work MacBook, personal MacBooks, a Windows PC, and claude-dev (a
Linux container).

## Machines

`chezmoi init` asks a Mac once whether it's **work** or **personal**; Linux is
always **server** and never prompts. The answer lives in
`~/.config/chezmoi/chezmoi.toml` (re-ask with `chezmoi init --prompt`).

| | work Mac | personal Mac | server (claude-dev) |
|---|---|---|---|
| zsh, Starship, ssh, atuin, mise, topgrade, VS Code | yes | yes | no |
| git, gh, `~/.claude/CLAUDE.md` | yes | yes | yes (no 1Password signing, no delta) |
| Claude Code `settings.json` | yes | yes | no |
| `~/.Brewfile` App Store apps | shared + Office/OneDrive/Windows App | shared + personal list | n/a |

## Layout

Everything chezmoi manages is under `home/` (set by `.chezmoiroot`), in
chezmoi's naming: `dot_zshrc` is `~/.zshrc`, `private_dot_ssh/` is `~/.ssh`
(mode 700), and a `.tmpl` suffix means the file is rendered per machine.

- `home/.chezmoi.toml.tmpl`: the machine prompt and chezmoi settings
- `home/.chezmoiignore`: what each OS skips
- `home/.chezmoiscripts/`: `brew bundle` whenever the rendered Brewfile changes
- `bin/doctor`, `install.sh`, `macos/`, `npm/`: repo tooling, not deployed

**Symlink mode.** Plain files are symlinks into `~/dotfiles/home`, so editing
`~/.zshrc` edits the repo, same as before chezmoi. Templates (`.gitconfig`,
`.ssh/config`, `.Brewfile`) are rendered copies: edit the
source with `chezmoi edit ~/.gitconfig`, then `chezmoi apply`.

**Encrypted files.** This repo is public, so homelab details (LAN hosts, users,
ports) live in `encrypted_*.age` files, age-encrypted with chezmoi. Today that's
just `~/.ssh/config.homelab`, which `~/.ssh/config` pulls in with `Include`.
Each machine needs the key at `~/.config/chezmoi/key.txt`; it's in personal
1Password as the document "chezmoi age key", and `install.sh` fetches it with `op`. Edit with
`chezmoi edit ~/.ssh/config.homelab`. Without the key, `chezmoi apply
--exclude encrypted` applies everything else.

## Install

```bash
git clone git@github.com:JoeKarlsson/dotfiles.git ~/dotfiles
~/dotfiles/install.sh
```

Installs Homebrew and chezmoi if needed, asks work/personal, shows a diff
before replacing any existing file, runs `brew bundle`, installs mise
runtimes, and optionally applies macOS defaults.

## Windows

Windows is always machine **windows** (no prompt). It gets the OS-neutral
config plus a few Windows-only pieces:

- `~/.winget.json` (`home/dot_winget.json`): the Windows `~/.Brewfile`, a
  `winget import` list (Git, chezmoi, Handy, AutoHotkey, PowerToys). A
  chezmoi script installs anything missing whenever the file changes.
- `~/Documents/AutoHotkey/mac-keys.ahk`: Mac-style shortcuts. Left Alt (the
  key in the Cmd position) acts as Cmd: Cmd+C/V/Z/T/W/Q, Cmd+arrows for
  line/document start and end, Cmd+Shift+3/4 screenshots. Only those
  combinations change, so Ctrl and other apps' hotkeys (Handy's Ctrl+Space)
  still work. A chezmoi script adds it to Startup and reloads it on change.
- VS Code: `~/AppData/Roaming/Code/User/settings.json` and
  `keybindings.json` are rendered from the Mac files (keybindings with `cmd`
  swapped for `ctrl`), so edit the Mac ones. Extensions come from the
  Brewfile's `vscode` lines.
- `windows/set-defaults.ps1` (not deployed, `install.ps1` offers it): show
  file extensions and hidden files in Explorer.
- PowerShell profile: `~/.config/powershell/profile.ps1` (port of
  `.zshrc`), loaded from `$PROFILE` by a chezmoi script that also sets the
  execution policy to RemoteSigned for the current user.

Windows has no symlinks without Developer Mode, so files are copies: edit with
`chezmoi edit <file>`, then `chezmoi apply`.

```powershell
git clone https://github.com/JoeKarlsson/dotfiles.git ~/dotfiles
powershell -ExecutionPolicy Bypass -File ~/dotfiles/install.ps1
```

## Day to day

```bash
chezmoi status          # anything out of sync with the repo?
chezmoi diff            # what apply would change
chezmoi apply           # make ~ match the repo
chezmoi update          # git pull + apply (other machines, after a push)
chezmoi add ~/.foo      # start tracking a new file
~/dotfiles/bin/doctor   # full check: chezmoi drift, repo, Brewfile, tools, ssh
```

If an app saves over one of its symlinks (Claude Code and VS Code sometimes
do), `chezmoi status` and `doctor` flag it. Keep the local version with
`chezmoi add <file> && chezmoi apply <file>`, or discard it with
`chezmoi apply <file>`.

## Manual Steps After Install

1. If `install.sh` couldn't get the age key from 1Password, save it to `~/.config/chezmoi/key.txt` (mode 600) and run `chezmoi apply`
1. Copy `npm/.npmrc.template` to `~/.npmrc` and add your npm auth token
2. Install a [Nerd Font](https://www.nerdfonts.com/) (Ghostty is set to MesloLGS NF) so the Starship prompt's icons render
3. Open a new terminal session to load everything
