#!/bin/bash

TMUX=$(command -v tmux)
tmux() {
	"$TMUX" -S common/temp/tmux "$@"
}
mtmux() {
	local CMD=$1
	shift
	tmux $CMD -t emergency-watch "$@"
}

mkdir -p common/temp
mtmux has-session 2>/dev/null && mtmux kill-session
mtmux new-session -d
tmux set -g mouse on
tmux set -g allow-rename on

tmux bind-key -T root Left select-window -p
tmux bind-key -T root Right select-window -n

node=$(command -v node)
builder="$(pwd)/scripts/emergency-watch.js"

LIST=$(bash scripts/simple-each.sh)
echo "=========================="
for i in ${LIST}; do
	echo "  -> $i"
	mtmux new-window -n '🕒' -c "$i" /bin/bash -c "'$node' '$builder' || { echo -ne 'Watch died. \ek💀\e\\' ; read ; }"
done
tmux kill-window -t 0
echo "=========================="

mtmux attach
mtmux kill-session
