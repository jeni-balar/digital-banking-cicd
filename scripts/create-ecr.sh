#!/usr/bin/env bash
set -euo pipefail
REGION="${AWS_REGION:-ap-south-1}"
REPO="${ECR_REPO:-digital-banking}"
aws ecr describe-repositories --repository-names "$REPO" --region "$REGION" >/dev/null 2>&1 || aws ecr create-repository --repository-name "$REPO" --region "$REGION"
echo "ECR repository ready: $REPO"
