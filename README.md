# End-to-End CI/CD Deployment of Cloud-Native Digital Banking & Transaction Processing Platform

Reference implementation for:
GitHub -> Jenkins webhook -> Maven/TestNG -> Docker -> Amazon ECR -> Ansible -> EKS Dev -> EKS Staging -> approval -> EKS Production -> Prometheus/Grafana.

The app is intentionally lightweight and uses in-memory data so the DevOps pipeline can be demonstrated without a database.

## API
- GET /api/health
- GET /api/accounts
- POST /api/accounts
- POST /api/transactions
- GET /api/transactions
- GET /actuator/health
- GET /actuator/prometheus

## Local build
```bash
mvn clean test
mvn spring-boot:run
```

## Docker
```bash
mvn clean package
docker build -t digital-banking:local .
docker run -p 8080:8080 digital-banking:local
```

## Kubernetes environments
- `banking-dev`
- `banking-staging`
- `banking-prod`

The same immutable ECR image tag is promoted through the environments.

## Important
This is a DevOps portfolio/demo banking platform, not a real financial system. Do not use it for real customer or financial data.
