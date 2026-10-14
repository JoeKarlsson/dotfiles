#
# Windows defaults (the twin of macos/set-defaults.sh). Current user only, no
# admin needed. Safe to re-run.
#
# Usage: powershell -ExecutionPolicy Bypass -File ~/dotfiles/windows/set-defaults.ps1
#
$advanced = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"

# Explorer: show file extensions (so invoice.pdf.exe doesn't pass as invoice.pdf)
Set-ItemProperty $advanced -Name HideFileExt -Value 0
# Explorer: show hidden files and folders (dotfiles, AppData)
Set-ItemProperty $advanced -Name Hidden -Value 1

# Restart Explorer so the changes show up now
Stop-Process -Name explorer -Force
Write-Host "[ok]   Windows defaults applied"
