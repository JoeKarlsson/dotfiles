# Dotfiles

This dotfiles have my installation instruction for Arch Linux and the configuration for my essential programs. The `master` branch contains a configuration for MacOS, `ubuntu` for ubuntu OS.


## Install

Fetch dotfiles from github:

```
git clone https://github.com/cristianpb/dotfiles ~/.dotfiles
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
