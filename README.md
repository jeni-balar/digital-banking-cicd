# End-to-End CI/CD Deployment of Cloud-Native Digital Banking & Transaction Processing Platform

An end-to-end DevOps project that automates the build, testing, containerization, deployment, and monitoring of a Spring Boot Digital Banking application on AWS.

## 🏗️ Architecture

![Digital Banking CI/CD Architecture](architecture/architecture.png)

**Digital Banking CI/CD Architecture on AWS**

---

## 📌 Project Overview

The project implements a complete CI/CD workflow using **GitHub and Jenkins** for automated application delivery.

The application is built and tested using **Maven and TestNG**, containerized using **Docker**, stored in **Amazon ECR**, and deployed to **Amazon EKS** using **Ansible and Kubernetes**.

The application is promoted through **Development → Staging → Production**, with a manual approval gate before Production deployment.

**Prometheus and Grafana** are used for application and Kubernetes monitoring.

---

## 🔄 CI/CD Pipeline

```text
GitHub
   ↓
Jenkins
   ↓
Build & Test
   ↓
TestNG Report
   ↓
Docker Build
   ↓
Amazon ECR
   ↓
Ansible
   ↓
Amazon EKS
   ↓
Dev → Staging → Production
              ↓
       Manual Approval
Key Pipeline Stages
GitHub source checkout
Maven build and TestNG testing
Test report generation
Docker image build
Amazon ECR authentication and image push
Dev deployment and smoke test
Staging deployment and smoke test
Production approval
Production deployment and smoke test
🛠️ Technologies
Category	Technologies
Cloud	AWS
Source Control	GitHub
CI/CD	Jenkins
Application	Java, Spring Boot
Build & Testing	Maven, TestNG
Containerization	Docker
Registry	Amazon ECR
Automation	Ansible
Orchestration	Kubernetes, Amazon EKS
Monitoring	Prometheus, Grafana
Networking	Amazon VPC, LoadBalancer
☸️ Kubernetes Deployment

The application is deployed on Amazon EKS using Kubernetes with separate namespaces for environment isolation:

banking-dev
banking-staging
banking-prod

The application is exposed externally through a Kubernetes LoadBalancer Service.

📊 Monitoring

Spring Boot exposes application metrics through:

/actuator/prometheus

Prometheus collects the metrics and Grafana provides the monitoring dashboard.

Grafana Panels
CPU Usage
Memory Usage
Request Rate
JVM Heap Memory
Kubernetes Pod Health
HTTP Error Rate
🔍 Key Verification

The deployment was verified through:

Successful Jenkins pipeline and Stage View
TestNG test results
Docker image successfully pushed to Amazon ECR
EKS cluster and worker nodes in Ready state
Kubernetes Pods in Running/Ready state
Successful deployment rollout
LoadBalancer external endpoint
Browser-based application access
Successful banking transaction
Spring Boot health check
Prometheus target verification
Grafana monitoring dashboard
🧩 Key Troubleshooting
Kubernetes Manifest Path: Resolved an Ansible deployment issue by using playbook_dir to correctly locate the Kubernetes manifest regardless of Jenkins' current working directory.
ECR Authentication: Configured Docker authentication with the private Amazon ECR repository before pushing the application image.
Pod Readiness: Verified and monitored Kubernetes Pods until the application replicas reached the expected Running/Ready state.
📄 Project Documentation

For the complete step-by-step implementation with AWS console screenshots, configuration details, testing, and troubleshooting:

📄 View Project Implementation Report

👩‍💻 Author

Jeni Balar

Digital Banking CI/CD Project on AWS


**Important:** I used `.pdf` in the report link. If the actual file you uploaded has a different extension or exact capitalization, the link must match the GitHub filename **exactly**.
