#!/usr/bin/env bash
# Builds the storefront image (linux/arm64), pushes it to Docker Hub and rolls it out on the k3s VM.
# Runs on every push to main (.github/workflows/deploy.yml); by hand:
#
#   bash DevOps/deploy-to-vm.sh
set -euo pipefail

IMAGE="docker.io/zekeriyakoca/printmeart-storefront:current"
KEY="${SSH_KEY:-$HOME/.ssh/ssh-ovm-printmeart.key}"
SSH_TARGET="${SSH_HOST:-ubuntu@lontray.art}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

docker buildx build --platform linux/arm64 -t "$IMAGE" --push "$ROOT_DIR"

ssh -i "$KEY" -o StrictHostKeyChecking=accept-new "$SSH_TARGET" 'export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
  kubectl apply -f - && kubectl -n printmeart rollout restart deployment/storefront
  kubectl -n printmeart rollout status deployment/storefront --timeout=3m' < "$ROOT_DIR/DevOps/k3s/storefront.yaml"
