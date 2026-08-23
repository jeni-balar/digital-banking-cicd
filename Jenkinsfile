pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REPO = 'digital-banking'
        EKS_CLUSTER = 'digital-banking-eks'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Test') {
            steps {
                sh 'mvn clean test'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'target/surefire-reports/*.xml'
                    archiveArtifacts artifacts: 'target/surefire-reports/**/*', allowEmptyArchive: true
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t ${ECR_REPO}:${IMAGE_TAG} .'
            }
        }

        stage('ECR Login & Push') {
            steps {
                sh '''
                  AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
                  ECR_URI=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}
                  aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                  docker tag ${ECR_REPO}:${IMAGE_TAG} ${ECR_URI}:${IMAGE_TAG}
                  docker push ${ECR_URI}:${IMAGE_TAG}
                '''
            }
        }

        stage('Deploy to Dev') {
            steps {
                sh '''
                  export AWS_REGION=${AWS_REGION}
                  export ECR_REPO=${ECR_REPO}
                  export EKS_CLUSTER=${EKS_CLUSTER}
                  ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e env_name=dev -e image_tag=${IMAGE_TAG}
                '''
            }
        }

        stage('Smoke Test Dev') {
            steps {
                sh '''
                  URL=$(kubectl -n banking-dev get svc digital-banking -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
                  echo "Dev URL: http://${URL}/api/health"
                  for i in $(seq 1 30); do
                    if curl -fsS "http://${URL}/api/health"; then exit 0; fi
                    sleep 10
                  done
                  exit 1
                '''
            }
        }

        stage('Deploy to Staging') {
            steps {
                sh '''
                  ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e env_name=staging -e image_tag=${IMAGE_TAG}
                '''
            }
        }

        stage('Smoke Test Staging') {
            steps {
                sh '''
                  URL=$(kubectl -n banking-staging get svc digital-banking -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
                  echo "Staging URL: http://${URL}/api/health"
                  for i in $(seq 1 30); do
                    if curl -fsS "http://${URL}/api/health"; then exit 0; fi
                    sleep 10
                  done
                  exit 1
                '''
            }
        }

        stage('Production Approval') {
            steps {
                input message: 'Promote the validated image to production?', ok: 'Deploy to Production'
            }
        }

        stage('Deploy to Production') {
            steps {
                sh '''
                  ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e env_name=prod -e image_tag=${IMAGE_TAG}
                '''
            }
        }
    }
}
