#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s inherit_errexit extglob nullglob globstar lastpipe shift_verbose

# 在systemd容器里启动一个claude

CLAUDE_ARGS=("$@" --dangerously-skip-permissions)
UNIT_NAME="claude$(systemd-escape "$(pwd)").service"
USER_SESSION=(--system)

TMUX_BIN=$(command -v tmux)
if [[ -z "$TMUX_BIN" ]]; then
	echo "Tmux not found in PATH"
	exit 1
fi

WORKSPACE_DIR=$(git rev-parse --show-toplevel)
if [[ -z "$WORKSPACE_DIR" ]]; then
	echo "Cannot find git root from $(pwd)"
	exit 1
fi

mkdir -p /run/claude
TMUX_SOCKET="/run/claude/tmux.sock"
mkdir -p "$(dirname "$TMUX_SOCKET")"

if systemctl "${USER_SESSION[@]}" is-active -q "$UNIT_NAME"; then
	if [[ -e "$TMUX_SOCKET" ]]; then
		exec "${TMUX_BIN}" -S "$TMUX_SOCKET" attach
	else
		echo "Claude instance is stale" >&2
		exit 1
	fi
else
	if [[ -e "$TMUX_SOCKET" ]]; then
		echo "Tmux socket exists but unit is not running. Cleaning up stale socket." >&2
		unlink "$TMUX_SOCKET"
	fi
fi

UNIT_ARGS=(
	--property=RuntimeDirectory=claude
	--collect
	 "${USER_SESSION[@]}"
	"--setenv=IS_SANDBOX=1"
	)

# 绑定工作目录到容器内
VIRTUAL_WORKSPACE="/run/claude/workspace"
UNIT_ARGS+=(
	--working-directory="${VIRTUAL_WORKSPACE}"
	--setenv="WORKSPACE_DIR=${VIRTUAL_WORKSPACE}"
	--property=BindPaths="${WORKSPACE_DIR}:${VIRTUAL_WORKSPACE}"
)

# 虚拟git仓库
UNIT_ARGS+=(
	--property=TemporaryFileSystem="${VIRTUAL_WORKSPACE}/.git"
)

# pnpm-store
PNPM_STORE_DIR="$(pnpm store path)"
UNIT_ARGS+=(
	--property=BindPaths="${PNPM_STORE_DIR}:${PNPM_STORE_DIR}"
)

# 绑定用户的 claude 到容器内的 /home/claude
CLAUDE_BIN=$(realpath $(command -v claude))
V_BIN=/run/claude/claude
UNIT_ARGS+=(
	--property=ProtectHome=tmpfs
	--setenv=HOME=/run/claude/home
	--setenv=PATH="/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:/run/claude/home/.local/bin:$(dirname "$V_BIN")"
	--property=BindPaths="$CLAUDE_BIN:$V_BIN"
	--property=BindPaths="$HOME/.local/share/claude:/run/claude/home/.local/share/claude"
	--property=BindPaths="$HOME/.claude:/run/claude/home/.claude"
	--property=BindPaths="$HOME/.claude.json:/run/claude/home/.claude.json"
)

# 限制访问权限
# useradd --uid 12345 --gid 0 --create-home --no-user-group --non-unique --shell /bin/bash claudeuser
UNIT_ARGS+=(
	# --property="ExecStartPre=+bash ${VIRTUAL_WORKSPACE}/scripts/prepare_workspace.sh"
	# --property="ExecStopPost=+bash ${VIRTUAL_WORKSPACE}/scripts/prepare_workspace.sh --back"
	--property=PrivateDevices=yes
	--property=ProtectKernelTunables=yes
	--property=ProtectKernelModules=yes
	--property=ProtectControlGroups=yes
	--property=ProtectSystem=strict
	--property=PrivateTmp=yes
	--property=NoNewPrivileges=yes
)

# 特殊环境变量
{
	export -p \
	| grep -vE 'SHELL|BASH|UID|PID|XDG_|TMUX|LC_' \
	| grep -vE ' (HOME|USER|TERM|SHLVL|LANG|PWD|PATH)='

	cat <<-EOF
		declare -xr PS1='\[\][\[\e[38;5;208m\]CLAUDE\[\e[0m\] \W]# \[\]'
	EOF
} > "/run/claude/env.sh"
UNIT_ARGS+=(
	--property=BindReadOnlyPaths="/run/claude/env.sh:/etc/profile.d/00-claude-env.sh"
)

x() {
	echo "Running: $*" >&2
	"$@"
}

x systemd-run \
	--unit="$UNIT_NAME" \
	--service-type=forking \
	--description="Claude Instance in $(pwd)" \
	--slice=claude.slice \
	"${UNIT_ARGS[@]}" \
	"${TMUX_BIN}" -S "${TMUX_SOCKET}" new-session -d /bin/bash --login -i

# x "${TMUX_BIN}" -S "$TMUX_SOCKET" set-window-option remain-on-exit on
x "${TMUX_BIN}" -S "$TMUX_SOCKET" new-window -c "${VIRTUAL_WORKSPACE}" -n init-git bash --login -c "git init . && git add . && git commit -m 'Initial commit'"
x "${TMUX_BIN}" -S "$TMUX_SOCKET" new-window -c "${VIRTUAL_WORKSPACE}" -n claude "${V_BIN}" "${CLAUDE_ARGS[@]}"

sleep 0.5

exec "${TMUX_BIN}" -S "$TMUX_SOCKET" attach
