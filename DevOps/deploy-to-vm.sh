#!/usr/bin/env bash
# Builds the storefront and room mockup images (linux/arm64), pushes them to Docker Hub and rolls them out on the k3s VM.
# Runs on every push to main (.github/workflows/deploy.yml); by hand:
#
#   bash DevOps/deploy-to-vm.sh
set -euo pipefail

IMAGE="docker.io/zekeriyakoca/printmeart-storefront:current"
MOCKUPS_IMAGE="docker.io/zekeriyakoca/printmeart-mockups:current"
KEY="${SSH_KEY:-$HOME/.ssh/ssh-ovm-printmeart.key}"
SSH_TARGET="${SSH_HOST:-ubuntu@lontray.art}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

docker buildx build --platform linux/arm64 -t "$IMAGE" --push "$ROOT_DIR"
docker buildx build --platform linux/arm64 -t "$MOCKUPS_IMAGE" -f "$ROOT_DIR/scripts/mockups/Dockerfile" --push "$ROOT_DIR"

ssh -i "$KEY" -o StrictHostKeyChecking=accept-new "$SSH_TARGET" 'export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
  kubectl apply -f - && kubectl -n printmeart rollout restart deployment/storefront
  kubectl -n printmeart rollout status deployment/storefront --timeout=3m' < "$ROOT_DIR/DevOps/k3s/storefront.yaml"
# The mockup job picks up the new image on its next run
ssh -i "$KEY" "$SSH_TARGET" 'KUBECONFIG=/etc/rancher/k3s/k3s.yaml kubectl apply -f -' < "$ROOT_DIR/DevOps/k3s/mockups.yaml"
