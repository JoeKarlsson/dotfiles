#
# dotfiles bootstrap for Windows (chezmoi). The Windows twin of install.sh.
#
# Usage (Windows PowerShell):
#   git clone https://github.com/JoeKarlsson/dotfiles.git ~/dotfiles
#   powershell -ExecutionPolicy Bypass -File ~/dotfiles/install.ps1
#
$ErrorActionPreference = "Stop"
$DotfilesDir = $PSScriptRoot

function Info($msg) { Write-Host "[info] $msg" -ForegroundColor Blue }
function Ok($msg)   { Write-Host "[ok]   $msg" -ForegroundColor Green }

# ===========================================================================
# git + chezmoi (winget). Everything else comes from ~/.winget.json, which a
# chezmoi script imports on every change.
# ===========================================================================
foreach ($id in "Git.Git", "twpayne.chezmoi") {
    winget list --id $id -e --accept-source-agreements | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Info "Installing $id..."
        winget install --id $id -e --silent --accept-package-agreements --accept-source-agreements
    }
}
# winget doesn't refresh this session's PATH
$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
            [Environment]::GetEnvironmentVariable("Path", "User")
Ok "chezmoi $((chezmoi --version) -split ' ' | Select-Object -Index 2)"

# ===========================================================================
# Apply. Windows is always machine "windows" (no prompt) and uses copies, not
# symlinks. Existing files are replaced after chezmoi shows a diff and asks.
# The .chezmoiscripts install ~/.winget.json and start the AutoHotkey shortcuts.
# ===========================================================================
chezmoi init --source "$DotfilesDir"

# The only encrypted file (~/.ssh/config.homelab) is Mac-only, so no age key
# is needed here.
chezmoi apply --exclude encrypted
Ok "Dotfiles applied (check with: chezmoi status)"

Write-Host ""
Ok "All done! Open a new terminal to load your config."
