# Dotfiles

This dotfiles have my installation instruction for Arch Linux and the configuration for my essential programs. The `master` branch contains a configuration for MacOS, `ubuntu` for ubuntu OS.


## Install

Fetch dotfiles from github:

```
git clone https://github.com/joekarlsson/dotfiles ~/.dotfiles
cd ~/.dotfiles || exit
```

Manually install files:

```
stow vim
```

Automatic install:

```
for d in $(ls -d */ | cut -f1 -d '/');
do
    ( stow "$d"  )
done
```

iTerm is a great alternative to macOS Terminal.app. The profile is a JSON export of my profile settings; to import Preferences -> General -> Load preferences from a custom folder or URL.