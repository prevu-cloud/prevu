#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
IMAGE_DIR="$ROOT_DIR/.prevu/images"
BASE_URL="${BASE_URL:-https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img}"
BASE_IMAGE="$IMAGE_DIR/noble-server-cloudimg-amd64.img"
OUTPUT_IMAGE="${OUTPUT_IMAGE:-$IMAGE_DIR/prevu-staging-ubuntu.qcow2}"

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 127
  fi
}

need curl
need qemu-img
need virt-customize

mkdir -p "$IMAGE_DIR"

if [[ ! -f "$BASE_IMAGE" ]]; then
  curl -fL "$BASE_URL" -o "$BASE_IMAGE"
fi

cp "$BASE_IMAGE" "$OUTPUT_IMAGE"
qemu-img resize "$OUTPUT_IMAGE" 20G

virt-customize \
  -a "$OUTPUT_IMAGE" \
  --install ca-certificates,curl,git,jq,unzip,build-essential,docker.io,docker-compose-v2,python3,python3-pip,golang-go \
  --run-command 'useradd -m -s /bin/bash prevu || true' \
  --run-command 'usermod -aG sudo,docker prevu || true' \
  --run-command 'mkdir -p /workspace /opt/prevu /var/log/prevu' \
  --run-command 'chown -R prevu:prevu /workspace /opt/prevu /var/log/prevu' \
  --run-command 'systemctl enable ssh || systemctl enable sshd || true' \
  --run-command 'systemctl enable docker || true' \
  --run-command 'touch /opt/prevu/provisioned'

qemu-img info "$OUTPUT_IMAGE"
