
set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."

systemd-run --quiet --wait --collect --pipe --pty --same-dir --unit=simple-watch.service \
	"--setenv=PATH=$PATH" \
	bash scripts/emergency-watch.child.sh
