# PowerShell port of ~/.zshrc for the Windows machine. $PROFILE dot-sources
# this file (the loader line is added by .chezmoiscripts/...windows-powershell-profile).
# Keep it ASCII and Windows PowerShell 5.1 compatible: no ?? / ?. / ternaries.

# ========================================
# Line editing (PSReadLine): emacs keys, Up/Down search history by prefix
# ========================================
if (Get-Module -ListAvailable PSReadLine) {
    Set-PSReadLineOption -EditMode Emacs -BellStyle None
    Set-PSReadLineOption -MaximumHistoryCount 50000 -HistoryNoDuplicates
    Set-PSReadLineOption -HistorySearchCursorMovesToEnd
    # Like HIST_IGNORE_SPACE: commands typed with a leading space stay out of history
    Set-PSReadLineOption -AddToHistoryHandler { param($line) -not $line.StartsWith(' ') }
    Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
    Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
    Set-PSReadLineKeyHandler -Key Ctrl+LeftArrow -Function BackwardWord
    Set-PSReadLineKeyHandler -Key Ctrl+RightArrow -Function ForwardWord
    Set-PSReadLineKeyHandler -Key Tab -Function MenuComplete
    # Inline suggestions from history (zsh-autosuggestions); needs PSReadLine 2.1+
    try { Set-PSReadLineOption -PredictionSource History -ErrorAction Stop } catch {}
}

# ========================================
# Environment and PATH
# ========================================
$env:EDITOR = 'code --wait'
foreach ($dir in "$HOME\bin", "$env:LOCALAPPDATA\mise\shims", "$HOME\.local\bin") {
    if ((Test-Path $dir) -and ($env:Path -split ';') -notcontains $dir) { $env:Path = "$dir;$env:Path" }
}

# ========================================
# Navigation
# ========================================
function home { Set-Location ~ }
function dev { Set-Location ~\Documents\dev }
function cq { Set-Location ~\Documents\dev\cloudquery }
function cdata { Set-Location ~\Documents\dev\cdata }
function joe { Set-Location ~\Documents\dev\joe }
function docs { Set-Location ~\Documents }
function dl { Set-Location ~\Downloads }
function dt { Set-Location ~\Desktop }
function cs { Set-Location ~\claude-skills }
function skills { Set-Location ~\claude-skills }
function .. { Set-Location .. }
function ... { Set-Location ..\.. }
function f { explorer.exe . }

# cd to the folder open in the front-most Explorer window (zsh: cdf for Finder)
function cdf {
    $win = @((New-Object -ComObject Shell.Application).Windows()) |
        Where-Object { $_.FullName -like '*explorer.exe' } | Select-Object -First 1
    $dir = if ($win) { $win.Document.Folder.Self.Path } else { [Environment]::GetFolderPath('Desktop') }
    "cd to `"$dir`""
    Set-Location $dir
}

# ========================================
# Better defaults
# ========================================
function ll { Get-ChildItem -Force @args }

# Human-only niceties. Claude Code (CLAUDECODE=1) loads this profile into the
# shell it runs commands in, where a cd that lists the directory buries output.
if (-not $env:CLAUDECODE) {
    Remove-Item Alias:cd -Force -ErrorAction SilentlyContinue
    function cd { Set-Location @args; if ($?) { ll } }
    function c { Clear-Host }
}

if (Get-Command vim -ErrorAction SilentlyContinue) {
    Set-Alias v vim
    Set-Alias vi vim
}

# ========================================
# Git (gcm is a built-in alias for Get-Command; this replaces it)
# ========================================
Remove-Item Alias:gcm -Force -ErrorAction SilentlyContinue
function g { git @args }
function gs { git status @args }
function gcm { git commit -m @args }
function gco { git checkout @args }
function ga { git add @args }

# ========================================
# Utilities (Windows equivalents of the macOS ones)
# ========================================
function bell { [Console]::Beep() }
function ip { (Invoke-RestMethod ipinfo.io/ip).Trim() }
function ips {
    Get-NetIPAddress -AddressFamily IPv4 | Where-Object IPAddress -ne '127.0.0.1' |
        Select-Object -ExpandProperty IPAddress
}
function pubkey {
    Get-Content ~\.ssh\id_ed25519.pub | Set-Clipboard
    '=> Public key copied to clipboard.'
}
function currentdate { Get-Date -Format 'yyyy.MM.dd' }
function path { $env:Path -split ';' }

# ========================================
# File and folder management
# ========================================
function mcd { param($dir) New-Item -ItemType Directory -Force $dir | Out-Null; Set-Location $dir }
function zipf { param($dir) Compress-Archive -Path $dir -DestinationPath "$($dir.TrimEnd('\/')).zip" }

# ========================================
# Dev tools
# ========================================
function sha256 { param($file) (Get-FileHash -Algorithm SHA256 $file).Hash.ToLower() }
function tailf { param($file) Get-Content $file -Tail 20 -Wait }
function server { param($port = 8000) python -m http.server $port }
function e { code . }

# ========================================
# Node / npm / pnpm
# ========================================
function pn { pnpm @args }
function npmst { npm start @args }
function npmt { npm test @args }
function npmrm { Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue; npm install }

# ========================================
# yt-dlp
# ========================================
function ytdl { yt-dlp @args }
function ydlmp4 { yt-dlp -f 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best' @args }
function ydlmkv { yt-dlp -f 'bestvideo[ext=mkv]+bestaudio[ext=mka]/best[ext=mkv]/best' @args }

# Full quality download with archive tracking, metadata, and organized output.
# Same format ladder as the zsh alias: for each height from 4320 down to 144,
# prefer AV1 > VP9.2 > VP9 > AVC (>30fps first), then fall back to plain bestvideo.
function ytdlp {
    $ladder = foreach ($h in 4320, 2880, 2160, 1440, 1080, 720, 480, 360) {
        foreach ($fps in '[fps>30]', '') {
            foreach ($c in '[vcodec^=av01]', '[vcodec^=vp9.2]', '[vcodec^=vp9]', '[vcodec^=avc1]', '') {
                "bestvideo$c[height>=$h]$fps"
            }
        }
    }
    $ladder += foreach ($h in 240, 144) {
        foreach ($fps in '[fps>30]', '') {
            foreach ($c in '[vcodec^=avc1]', '[vcodec^=av01]', '[vcodec^=vp9.2]', '[vcodec^=vp9]', '') {
                "bestvideo$c[height>=$h]$fps"
            }
        }
    }
    $format = '(' + (($ladder + 'bestvideo') -join '/') + ')+(bestaudio[acodec^=opus]/bestaudio)/best'
    $out = "$HOME\Videos\ytdlp"
    yt-dlp --format $format --verbose --force-ipv4 --sleep-requests 1 --sleep-interval 5 `
        --max-sleep-interval 30 --ignore-errors --no-continue --no-overwrites `
        --download-archive "$out\archive.log" --add-metadata `
        --parse-metadata '%(title)s:%(meta_title)s' --parse-metadata '%(uploader)s:%(meta_artist)s' `
        --write-annotations --concurrent-fragments 5 -P $out `
        --output '%(uploader)s/%(uploader)s - %(upload_date)s - %(title)s [%(id)s].%(ext)s' @args
}

# ========================================
# Prompt and tools, each only if installed: starship, zoxide (z / zi),
# atuin (Ctrl-R history; Up arrow stays the prefix search above)
# ========================================
$env:FZF_DEFAULT_COMMAND = 'fd --type f --hidden --exclude .git'
$env:FZF_CTRL_T_COMMAND = $env:FZF_DEFAULT_COMMAND
$env:FZF_ALT_C_COMMAND = 'fd --type d --hidden --exclude .git'

if (Get-Command starship -ErrorAction SilentlyContinue) {
    # Tab title: current dir at the prompt (zsh: _title_precmd)
    function Invoke-Starship-PreCommand {
        $host.UI.RawUI.WindowTitle = $PWD.Path.Replace($HOME, '~')
    }
    Invoke-Expression (& starship init powershell --print-full-init | Out-String)
} else {
    function prompt {
        $dir = $PWD.Path.Replace($HOME, '~')
        $host.UI.RawUI.WindowTitle = $dir
        "$dir> "
    }
}
if (Get-Command zoxide -ErrorAction SilentlyContinue) {
    Invoke-Expression (& zoxide init powershell | Out-String)
}
if (Get-Command atuin -ErrorAction SilentlyContinue) {
    Invoke-Expression (& atuin init powershell --disable-up-arrow | Out-String)
}
