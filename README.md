# Dotfiles

This dotfiles have my installation instruction for Arch Linux and the configuration for my essential programs. The `master` branch contains a configuration for MacOS, `ubuntu` for ubuntu OS.

## Prerequisites

Make sure the following requirements are installed:

<details>
<summary>Expand</summary>

### Homebrew

Install [Homebrew](https://brew.sh) if you haven't.

### Git

You can either install git via Xcode Command Line Tools or by running `git --version` from your terminal.

### Zsh & Oh-My-Zsh

[The Z shell](https://github.com/robbyrussell/oh-my-zsh/wiki/Installing-ZSH), is an extended version of the Bourne Shell (sh), with plenty of new features, and support for plugins and themes. [Oh My Zsh](https://github.com/robbyrussell/oh-my-zsh) is a delightful community-driven framework for managing your zsh configuration.

This project use [purer](https://github.com/DFurnes/purer) as the prompt theme for zsh: `npm install --global purer-prompt`


### NVM

Node Version Manager - Simple bash script to manage multiple active node.js versions. To install nvm: https://github.com/creationix/nvm.


### Tmux

[Tmux](https://github.com/tmux/tmux/wiki) is the terminal multiplexer I can't live without. 
</details>

## Install

Fetch dotfiles from github:

```
git clone https://github.com/joekarlsson/dotfiles ~/.dotfiles
cd ~/.dotfiles || sh ./quick-start.sh
```

Manually install files:

```
stow vim
```

Use Homebrew to install some necessary packages defined in `Brewfile`:

```bash
$ brew bu

You will need to manuall import the iTerm2 settings. iTerm is a great alternative to macOS Terminal.app. The profile is a JSON export of my profile settings; to import Preferences -> General -> Load preferences from a custom folder or URL.

## Highlights

The `Brewfile` contains some interesting CLI tools for better development like

- `bat`, an alternative of `cat`
- `htop`, an interactive process viewer for Unix systems
- `nnn`, a very fast terminal file manager
- `ripgrep`, a line-oriented search tool
- `stow`, a symlink farm manager
- `the_silver_searcher`, a code searching tool (used in vim)
- `fzf`, command-line fuzzy finder
- `tig`, text-mode interface for git
- `universal-ctags`, a programming tool to generate tag files