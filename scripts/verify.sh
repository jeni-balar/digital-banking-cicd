#!/usr/bin/env bash
set -euo pipefail
kubectl get nodes
kubectl get pods -A
kubectl get svc -A
kubectl get deployment -n banking-dev
kubectl get deployment -n banking-prod
