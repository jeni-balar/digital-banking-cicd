#!/usr/bin/env bash
set -euo pipefail

sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg unzip git docker.io ansible maven awscli

sudo systemctl enable --now docker

sudo usermod -aG docker jenkins || true
sudo usermod -aG docker "$USER" || true

sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /etc/apt/keyrings/jenkins-keyring.asc >/dev/null
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list >/dev/null
sudo apt-get update
sudo apt-get install -y fontconfig openjdk-17-jre jenkins
sudo systemctl enable --now jenkins

echo "Jenkins installed. Log out/in after Docker group changes."
