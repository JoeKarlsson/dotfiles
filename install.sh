#!/bin/bash
set -euo pipefail

#
# dotfiles bootstrap (chezmoi). Files live under home/ in chezmoi's source
# format; chezmoi links or renders them into ~ and remembers ~/dotfiles as
# its source dir.
#
# Usage: git clone git@github.com:JoeKarlsson/dotfiles.git ~/dotfiles && ~/dotfiles/install.sh
#

DOTFILES_DIR="$(cd "$(dirname "$0")" && pwd)"

info() { printf "\033[0;34m[info]\033[0m %s\n" "$1"; }
ok()   { printf "\033[0;32m[ok]\033[0m   %s\n" "$1"; }

# ===========================================================================
# Homebrew + chezmoi
# ===========================================================================
if [ "$(uname)" = Darwin ]; then
    if ! command -v brew &>/dev/null; then
        info "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    ok "Homebrew"
    command -v chezmoi &>/dev/null || brew install chezmoi
else
    command -v chezmoi &>/dev/null || sh -c "$(curl -fsLS get.chezmoi.io)" -- -b "$HOME/.local/bin"
    export PATH="$HOME/.local/bin:$PATH"
fi
ok "chezmoi $(chezmoi --version | awk '{print $3}')"

# ===========================================================================
# Apply. On a Mac, init asks once whether this is a work or personal machine
# (it picks the App Store apps in ~/.Brewfile). Existing files are replaced
# after chezmoi shows a diff and asks; nothing is silently overwritten.
# The brew bundle step runs from home/.chezmoiscripts on every Brewfile change.
# ===========================================================================
chezmoi init --source "$DOTFILES_DIR"

# Age key for encrypted_* files (homelab ssh hosts). Kept out of the repo, in
# personal 1Password as the document "chezmoi age key". Without it, everything
# else still applies; drop the key in later and run `chezmoi apply`.
AGE_KEY="$HOME/.config/chezmoi/key.txt"
if [ ! -s "$AGE_KEY" ] && command -v op &>/dev/null; then
    op document get "chezmoi age key" --account my.1password.com \
        --out-file "$AGE_KEY" 2>/dev/null \
        && chmod 600 "$AGE_KEY" && ok "age key from 1Password"
fi
if [ -s "$AGE_KEY" ]; then
    chezmoi apply
else
    info "No age key at $AGE_KEY: skipping encrypted files (~/.ssh/config.homelab)"
    chezmoi apply --exclude encrypted
fi
ok "Dotfiles applied (check with: chezmoi status, bin/doctor)"

# ===========================================================================
# mise (Node and other runtimes, from ~/.config/mise/config.toml)
# ===========================================================================
if command -v mise >/dev/null; then
    mise install && ok "mise runtimes installed"
fi

# ===========================================================================
# macOS defaults (optional)
# ===========================================================================
if [ "$(uname)" = Darwin ]; then
    echo ""
    read -p "Apply macOS defaults? (y/N) " apply_defaults
    if [[ "$apply_defaults" =~ ^[Yy] ]]; then
        bash "$DOTFILES_DIR/macos/set-defaults.sh"
    else
        info "Skipping macOS defaults (run macos/set-defaults.sh later if desired)"
    fi
fi

echo ""
ok "All done! Open a new terminal to load your config."
echo ""
echo "Manual steps:"
[ -s "$AGE_KEY" ] || echo "  - Save the age key to $AGE_KEY (1Password: \"chezmoi age key\"), then chezmoi apply"
echo "  - Copy npm/.npmrc.template to ~/.npmrc and add your auth token"
echo "  - Install a Nerd Font (MesloLGS NF) for the Starship prompt icons: https://www.nerdfonts.com/"
