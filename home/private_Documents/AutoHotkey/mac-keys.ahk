#Requires AutoHotkey v2.0
#SingleInstance Force
; Mac-style shortcuts: Left Alt (the key in the Mac Cmd position) acts like Cmd.
; Only the shortcuts listed here change. Ctrl, Alt+Tab and other apps' hotkeys
; (e.g. Handy's Ctrl+Space) keep working as normal.

; Cmd+letter -> Ctrl+letter (and Cmd+Shift+letter -> Ctrl+Shift+letter)
for key in StrSplit("abcdefgiklnoprstuvwxy") {
    Hotkey "<!" key, SendCtrl.Bind(key)
    Hotkey "<!+" key, SendCtrlShift.Bind(key)
}
for key in ["1","2","3","4","5","6","7","8","9","0","=","-",",","/","Enter"] {
    Hotkey "<!" key, SendCtrl.Bind(key)
}
SendCtrl(key, *) => Send("^{" key "}")
SendCtrlShift(key, *) => Send("^+{" key "}")

; Undo / redo
<!z::Send "^z"
<!+z::Send "^y"

; Quit app
<!q::Send "!{F4}"

; Cmd+arrows: line start/end, document top/bottom (Shift selects)
<!Left::Send "{Home}"
<!Right::Send "{End}"
<!Up::Send "^{Home}"
<!Down::Send "^{End}"
<!+Left::Send "+{Home}"
<!+Right::Send "+{End}"
<!+Up::Send "^+{Home}"
<!+Down::Send "^+{End}"

; Cmd+Backspace: delete to start of line
<!Backspace::Send "+{Home}{Delete}"

; Screenshots: Cmd+Shift+3 full screen to file, Cmd+Shift+4 region
<!+3::Send "#{PrintScreen}"
<!+4::Send "#+s"

; Cmd+[ / ]: back/forward in browsers, otherwise Ctrl+[ / ]
#HotIf WinActive("ahk_exe chrome.exe") or WinActive("ahk_exe msedge.exe") or WinActive("ahk_exe firefox.exe") or WinActive("ahk_exe brave.exe") or WinActive("ahk_exe arc.exe")
<![::Send "!{Left}"
<!]::Send "!{Right}"
#HotIf
<![::Send "^["
<!]::Send "^]"
