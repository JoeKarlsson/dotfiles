# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
export ZSH=~/.oh-my-zsh

# See https://github.com/robbyrussell/oh-my-zsh/wiki/Themes
ZSH_THEME="agnoster"

DEFAULT_USER="joekarlsson1@gmail.com"
COMPLETION_WAITING_DOTS="true"
ZSH_HIGHLIGHT_HIGHLIGHTERS=(main brackets pattern cursor)
ZSH_HIGHLIGHT_PATTERNS=('rm -rf *' 'fg=white,bold,bg=red')

unsetopt nomatch
setopt APPEND_HISTORY
setopt INTERACTIVE_COMMENTS

plugins=(
  git
  git-extras
  git-flow
  github
  heroku
  iterm2
  lol
  osx
  sublime
  vagrant
  z
  web-search
)

source $ZSH/oh-my-zsh.sh

export EDITOR="vim";
export GREP_OPTIONS="--color=auto";


#             ██ ██
#            ░██░░
#   ██████   ░██ ██  ██████    ██████  █████   ██████
#  ░░░░░░██  ░██░██ ░░░░░░██  ██░░░░  ██░░░██ ██░░░░
#   ███████  ░██░██  ███████ ░░█████ ░███████░░█████
#  ██░░░░██  ░██░██ ██░░░░██  ░░░░░██░██░░░░  ░░░░░██
# ░░████████ ███░██░░████████ ██████ ░░██████ ██████
#  ░░░░░░░░ ░░░ ░░  ░░░░░░░░ ░░░░░░   ░░░░░░ ░░░░░░
#
alias zshconfig="$EDITOR ~/.zshrc"
alias ohmyzsh="$EDITOR ~/.oh-my-zsh"
alias ssource='source ~/.zshrc'
alias sz='source ~/.zshrc'

alias dev="cd ~/Documents/dev"
=alias docs="cd ~/Documents"
alias dl="cd ~/Downloads"
alias dt="cd ~/Desktop"


alias cp='cp -iv'                           # Preferred 'cp' implementation
alias mv='mv -iv'                           # Preferred 'mv' implementation
alias mkdir='mkdir -pv'                     # Preferred 'mkdir' implementation
alias ll='ls -FGlAhp'                       # Preferred 'ls' implementation
alias less='less -FSRXc'                    # Preferred 'less' implementation
cd() { builtin cd "$@"; ll; }               # Always list directory contents upon 'cd'
alias cd..='cd ../'                         # Go back 1 directory level (for fast typers)
alias ..='cd ../'                           # Go back 1 directory level
alias ...='cd ../../'                       # Go back 2 directory levels
alias .3='cd ../../../'                     # Go back 3 directory levels
alias .4='cd ../../../../'                  # Go back 4 directory levels
alias .5='cd ../../../../../'               # Go back 5 directory levels
alias .6='cd ../../../../../../'            # Go back 6 directory levels
alias edit='subl'                           # edit:         Opens any file in sublime editor
alias f='open -a Finder ./'                 # f:            Opens current directory in MacOS Finder
alias ~="cd ~"                              # ~:            Go Home
alias c='clear'                             # c:            Clear terminal display

alias path='echo -e ${PATH//:/\\n}'         # path:         Echo all executable Paths
alias show_options='shopt'                  # Show_options: display bash options settings
alias fix_stty='stty sane'                  # fix_stty:     Restore terminal settings when screwed up
alias cic='set completion-ignore-case On'   # cic:          Make tab-completion case-insensitive
mcd () { mkdir -p "$1" && cd "$1"; }        # mcd:          Makes new Dir and jumps inside
trash () { command mv "$@" ~/.Trash ; }     # trash:        Moves a file to the MacOS trash
ql () { qlmanage -p "$*" >& /dev/null; }    # ql:           Opens any file in MacOS Quicklook Preview
alias DT='tee ~/Desktop/terminalOut.txt'    # DT:           Pipe content to file on MacOS Desktop

alias lss="ls -Gal"
alias lp="ls -p"

alias h="history"
alias "cd.."="cd .."

alias hosts="sudo $EDITOR /etc/hosts"
alias c="cd"
alias g="git"
alias gs="git status"
alias gcm="git commit -m"
alias e="$EDITOR ."
alias ql="qlmanage -p"

alias yolo="git commit -am '`curl -s http://whatthecommit.com/index.txt`'"
alias yoloo="git commit -am '`curl -s http://whatthecommit.com/index.txt`' && git push origin master --force"

alias unhidelibrary="chflags nohidden ~/Library"
alias showdotfiles="defaults write com.apple.finder AppleShowAllFiles -bool true && killall Finder"
alias hidedotfiles="defaults write com.apple.finder AppleShowAllFiles -bool false && killall Finder"

alias cleanup="find . -type f -name '*.DS_Store' -ls -delete"
alias lscleanup="/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user && killall Finder"

alias pubkey="more ~/.ssh/id_rsa.pub | pbcopy | printf '=> Public key copied to pasteboard.\n'";

alias vup="vagrant up && vagrant provision && vagrant ssh"
alias vp="vagrant provision"
alias vs='sites && vagrant ssh'
alias vag="vagrant"

alias caff="caffeinate -dis"
alias lc="lolcat"

alias speedtest="speedtest-cli"
alias killnode="kill -9 $(ps aux | grep '\snode\s' | awk '{print $2}')"

# http://xkcd.com/530/
alias stfu="osascript -e 'set volume output muted true'"
alias pumpitup="osascript -e 'set volume 10'"

alias bell='echo "\a"'

alias v=vim
alias vi=vim
alias mvi=mvim

alias currentdate='date "+%Y.%m.%d"'

alias fs='fortune -as | cowsay -f small | lolcat'

alias ip="curl ipinfo.io/ip"
alias ips="ifconfig -a | perl -nle'/(\d+\.\d+\.\d+\.\d+)/ && print $1'"
alias stest="wget -O /dev/null http://speedtest.wdc01.softlayer.com/downloads/test10.zip"

alias ack=ag

alias ll1="tree --dirsfirst -ChFL 1"
alias ll2="tree --dirsfirst -ChFL 2"
alias ll3="tree --dirsfirst -ChFL 3"
alias ll4="tree --dirsfirst -ChFupDaL 1"
alias ll5="tree --dirsfirst -ChFupDaL 2"
alias ll6="tree --dirsfirst -ChFupDaL 3"

alias gist="gist -ec $1"
alias exot=exit

alias 3d="figlet -f 3d $1"

alias pc='phpcs --standard="WordPress" $@'
alias pcf='phpcbf --standard="WordPress" $@'
alias pcfall='find . | grep .php | xargs phpcbf --standard="WordPress"'

alias dand=dandelion
alias gifs_deploy="sh generate_json && git add . && git commit -m 'Gifs' && git push origin master && dandelion deploy"

alias tailf="less +F $0"

alias sha256="shasum -a 256 "$1" "

#   -----------------------------
#   Does a RTF copy to cllipboard all code in file
#   Usage: light js func.js
#   -----------------------------
function light() {
  if [ -z "$2" ]
    then src="pbpaste"
  else
    src="cat $2"
  fi
  highlight -O rtf --syntax $1 --font fira-code --font-size 24 $2 | pbcopy
}

#   -----------------------------
#   NPM
#   -----------------------------

(( $+commands[npm] )) && {
    __NPM_COMPLETION_FILE="${ZSH_CACHE_DIR}/npm_completion"

    if [[ ! -f $__NPM_COMPLETION_FILE ]]; then
        npm completion >! $__NPM_COMPLETION_FILE 2>/dev/null
        [[ $? -ne 0 ]] && rm -f $__NPM_COMPLETION_FILE
    fi

    [[ -f $__NPM_COMPLETION_FILE ]] && source $__NPM_COMPLETION_FILE

    unset __NPM_COMPLETION_FILE
}

alias npmg="npm i -g " # Install dependencies globally
alias npmS="npm i -S " # Install and save to dependencies in your package.json
alias npmD="npm i -D " # Install and save to dev-dependencies in your package.json
alias npmE='PATH="$(npm bin)":"$PATH"' # Execute command from node_modules folder based on current directory
alias npmO="npm outdated" # Check which npm modules are outdated
alias npmV="npm -v" # Check package versions
alias npmL="npm list" # Check package versions
alias npmst="npm start" # Run npm start
alias npmt="npm test" # Run npm test
alias npmrm="rm -rf node_modules && npm install" # Run npm test

#   -----------------------------
#   NODE
#   -----------------------------

# Open the node api for your current version to the optional section.
function node-docs {
  local section=${1:-all}
  open_command "https://nodejs.org/docs/$(node --version)/api/$section.html"
}


#   -----------------------------
#   ATOM
#   -----------------------------

local _atom_paths > /dev/null 2>&1
_atom_paths=(
    "$HOME/Applications/Atom.app"
    "/Applications/Atom.app"
)

for _atom_path in $_atom_paths; do
    if [[ -a $_atom_path ]]; then
        alias at="open -a '$_atom_path'"
        break
    fi
done

alias atom='at .'

#   -----------------------------
#   MAKE TERMINAL BETTER
#   -----------------------------

alias sz='source ~/.zshrc'
alias cp='cp -iv'                           # Preferred 'cp' implementation
alias mv='mv -iv'                           # Preferred 'mv' implementation
alias mkdir='mkdir -pv'                     # Preferred 'mkdir' implementation
alias ll='ls -FGlAhp'                       # Preferred 'ls' implementation
alias less='less -FSRXc'                    # Preferred 'less' implementation
cd() { builtin cd "$@"; ll; }               # Always list directory contents upon 'cd'
alias cd..='cd ../'                         # Go back 1 directory level (for fast typers)
alias ..='cd ../'                           # Go back 1 directory level
alias ...='cd ../../'                       # Go back 2 directory levels
alias .3='cd ../../../'                     # Go back 3 directory levels
alias .4='cd ../../../../'                  # Go back 4 directory levels
alias .5='cd ../../../../../'               # Go back 5 directory levels
alias .6='cd ../../../../../../'            # Go back 6 directory levels
alias edit='atom'                           # edit:         Opens any file in sublime editor
alias f='open -a Finder ./'                 # f:            Opens current directory in MacOS Finder
alias ~="cd ~"                              # ~:            Go Home
alias c='clear'                             # c:            Clear terminal display
alias path='echo -e ${PATH//:/\\n}'         # path:         Echo all executable Paths
alias show_options='shopt'                  # Show_options: display bash options settings
alias fix_stty='stty sane'                  # fix_stty:     Restore terminal settings when screwed up
alias cic='set completion-ignore-case On'   # cic:          Make tab-completion case-insensitive
mcd () { mkdir -p "$1" && cd "$1"; }        # mcd:          Makes new Dir and jumps inside
trash () { command mv "$@" ~/.Trash ; }     # trash:        Moves a file to the MacOS trash
ql () { qlmanage -p "$*" >& /dev/null; }    # ql:           Opens any file in MacOS Quicklook Preview
alias DT='tee ~/Desktop/terminalOut.txt'    # DT:           Pipe content to file on MacOS Desktop

#   -------------------------------
#   FILE AND FOLDER MANAGEMENT
#   -------------------------------

zipf () { zip -r "$1".zip "$1" ; }          # zipf:         To create a ZIP archive of a folder
alias numFiles='echo $(ls -1 | wc -l)'      # numFiles:     Count of non-hidden files in current dir
alias make1mb='mkfile 1m ./1MB.dat'         # make1mb:      Creates a file of 1mb size (all zeros)
alias make5mb='mkfile 5m ./5MB.dat'         # make5mb:      Creates a file of 5mb size (all zeros)
alias make10mb='mkfile 10m ./10MB.dat'      # make10mb:     Creates a file of 10mb size (all zeros)

#   cdf:  'Cd's to frontmost window of MacOS Finder
#   ------------------------------------------------------
    cdf () {
        currFolderPath=$( /usr/bin/osascript <<EOT
            tell application "Finder"
                try
            set currFolder to (folder of the front window as alias)
                on error
            set currFolder to (path to desktop folder as alias)
                end try
                POSIX path of currFolder
            end tell
EOT
        )
        echo "cd to \"$currFolderPath\""
        cd "$currFolderPath"
    }

#   -------------------------------
#   Monogo DB
#   -------------------------------

# load mongodb daemon
alias mongodb-start="launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist"

#unload mongodb daemon
alias mongodb-stop="launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist"

#
#                     ██   ██
# ██████             ░██  ░██
# ░██░░░██  ██████   ██████░██       ██████
# ░██  ░██ ░░░░░░██ ░░░██░ ░██████  ██░░░░
# ░██████   ███████   ░██  ░██░░░██░░█████
# ░██░░░   ██░░░░██   ░██  ░██  ░██ ░░░░░██
# ░██     ░░████████  ░░██ ░██  ░██ ██████
# ░░       ░░░░░░░░    ░░  ░░   ░░ ░░░░░░
#

test -e "${HOME}/.iterm2_shell_integration.zsh" && source "${HOME}/.iterm2_shell_integration.zsh"
ulimit -n 2000
[ -s "/Users/a6002304/.nvm/nvm.sh" ] && . "/Users/a6002304/.nvm/nvm.sh" # This loads nvm
export NODE_TLS_REJECT_UNAUTHORIZED=0

# added by travis gem
[ -f /Users/a6002304/.travis/travis.sh ] && source /Users/a6002304/.travis/travis.sh

PATH=${PATH}:/usr/local/bin
PATH=${PATH}:/usr/bin
PATH=${PATH}:/bin
PATH=${PATH}:/usr/sbin
PATH=${PATH}:/sbin
PATH=${PATH}:/usr/local/git/bin
PATH=${PATH}:/opt/sm/bin
PATH=${PATH}:/opt/sm/pkg/active/bin
PATH=${PATH}:/opt/sm/pkg/active/sbin
PATH=${PATH}:/usr/local/heroku/bin
export PATH="$PATH:/usr/local/bin/"
export PATH="/usr/local/git/bin:/sw/bin/:/usr/local/bin:/usr/local/:/usr/local/sbin:/usr/local/mysql/bin:$PATH"
export PATH="$PATH:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/php/bin:/usr/local/php5/bin"
export PATH=${PATH}
export PATH=$PATH:/Applications/Postgres.app/Contents/Versions/latest/bin

export PATH=$HOME/.binctl:$PATH