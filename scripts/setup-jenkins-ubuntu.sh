#!/usr/bin/env bash
set -euo pipefail

# Update system packages
sudo apt-get update

# Install required base packages
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    unzip \
    git \
    docker.io \
    ansible \
    maven \
    awscli \
    fontconfig \
    openjdk-21-jre

# Start and enable Docker
sudo systemctl enable --now docker

# Install kubectl
sudo mkdir -p -m 755 /etc/apt/keyrings

curl -fsSL \
    https://pkgs.k8s.io/core:/stable:/v1.36/deb/Release.key \
    | sudo gpg --dearmor \
    -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

sudo chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.36/deb/ /' \
    | sudo tee /etc/apt/sources.list.d/kubernetes.list >/dev/null

sudo apt-get update
sudo apt-get install -y kubectl

# Install Helm 3
curl -fsSL -o /tmp/get_helm.sh \
    https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3

chmod 700 /tmp/get_helm.sh
sudo /tmp/get_helm.sh
rm -f /tmp/get_helm.sh

# Install Jenkins
sudo mkdir -p /etc/apt/keyrings

curl -fsSL \
    https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key \
    | sudo tee /etc/apt/keyrings/jenkins-keyring.asc >/dev/null

echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" \
    | sudo tee /etc/apt/sources.list.d/jenkins.list >/dev/null

sudo apt-get update
sudo apt-get install -y jenkins

# Allow Jenkins and current user to use Docker
sudo usermod -aG docker jenkins
sudo usermod -aG docker "$USER"

# Enable and start Jenkins
sudo systemctl enable --now jenkins

# Restart Jenkins so it receives the Docker group membership
sudo systemctl restart jenkins

# Display installed versions
echo "========================================"
echo "Jenkins setup completed"
echo "========================================"

echo "Java:"
java -version

echo "Maven:"
mvn -version

echo "Docker:"
docker --version

echo "AWS CLI:"
aws --version

echo "kubectl:"
kubectl version --client

echo "Helm:"
helm version

echo "Ansible:"
ansible --version

echo "========================================"
echo "IMPORTANT:"
echo "Log out and log back in after Docker group changes."
echo "========================================"
