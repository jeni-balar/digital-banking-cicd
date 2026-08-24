pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REPO = 'digital-banking'
        EKS_CLUSTER = 'digital-banking-eks'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Test') {
            steps {
                sh 'mvn clean package'
            }

            post {
                always {
                    junit(
                        allowEmptyResults: true,
                        testResults: 'target/surefire-reports/*.xml'
                    )

                    archiveArtifacts(
                        artifacts: 'target/surefire-reports/**/*',
                        allowEmptyArchive: true
                    )
                }
            }
        }

        stage('TestNG HTML Report') {
            steps {
                sh 'mvn surefire-report:report-only'
            }

            post {
                always {
                    publishHTML(
                        target: [
                            allowMissing: true,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: 'target/reports',
                            reportFiles: 'surefire.html',
                            reportName: 'TestNG Test Report',
                            reportTitles: 'TestNG Results'
                        ]
                    )
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build \
                        -t ${ECR_REPO}:${IMAGE_TAG} \
                        .
                '''
            }
        }

        stage('ECR Login & Push') {
            steps {
                sh '''
                    AWS_ACCOUNT_ID=$(aws sts get-caller-identity \
                        --query Account \
                        --output text)

                    ECR_URI=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}

                    aws ecr get-login-password \
                        --region ${AWS_REGION} \
                        | docker login \
                        --username AWS \
                        --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                    docker tag \
                        ${ECR_REPO}:${IMAGE_TAG} \
                        ${ECR_URI}:${IMAGE_TAG}

                    docker push \
                        ${ECR_URI}:${IMAGE_TAG}
                '''
            }
        }

        stage('Deploy to Dev') {
            steps {
                sh '''
                    ansible-playbook \
                        -i ansible/inventory.ini \
                        ansible/deploy.yml \
                        -e env_name=dev \
                        -e image_tag=${IMAGE_TAG}
                '''
            }
        }

        stage('Smoke Test Dev') {
            steps {
                sh '''
                    echo "Waiting for Dev LoadBalancer..."

                    for i in $(seq 1 30); do

                        URL=$(kubectl -n banking-dev get svc digital-banking \
                            -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' \
                            2>/dev/null || true)

                        if [ -n "$URL" ]; then
                            echo "Dev URL: http://${URL}/api/health"

                            if curl -fsS "http://${URL}/api/health"; then
                                echo "Dev smoke test passed."
                                exit 0
                            fi
                        else
                            echo "Dev LoadBalancer hostname not available yet."
                        fi

                        sleep 10
                    done

                    echo "Dev smoke test failed."
                    exit 1
                '''
            }
        }

        stage('Deploy to Staging') {
            steps {
                sh '''
                    ansible-playbook \
                        -i ansible/inventory.ini \
                        ansible/deploy.yml \
                        -e env_name=staging \
                        -e image_tag=${IMAGE_TAG}
                '''
            }
        }

        stage('Smoke Test Staging') {
            steps {
                sh '''
                    echo "Waiting for Staging LoadBalancer..."

                    for i in $(seq 1 30); do

                        URL=$(kubectl -n banking-staging get svc digital-banking \
                            -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' \
                            2>/dev/null || true)

                        if [ -n "$URL" ]; then
                            echo "Staging URL: http://${URL}/api/health"

                            if curl -fsS "http://${URL}/api/health"; then
                                echo "Staging smoke test passed."
                                exit 0
                            fi
                        else
                            echo "Staging LoadBalancer hostname not available yet."
                        fi

                        sleep 10
                    done

                    echo "Staging smoke test failed."
                    exit 1
                '''
            }
        }

        stage('Production Approval') {
            steps {
                input(
                    message: 'Promote the validated image to production?',
                    ok: 'Deploy to Production'
                )
            }
        }

        stage('Deploy to Production') {
            steps {
                sh '''
                    ansible-playbook \
                        -i ansible/inventory.ini \
                        ansible/deploy.yml \
                        -e env_name=prod \
                        -e image_tag=${IMAGE_TAG}
                '''
            }
        }

        stage('Smoke Test Production') {
            steps {
                sh '''
                    echo "Waiting for Production LoadBalancer..."

                    for i in $(seq 1 30); do

                        URL=$(kubectl -n banking-prod get svc digital-banking \
                            -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' \
                            2>/dev/null || true)

                        if [ -n "$URL" ]; then
                            echo "Production URL: http://${URL}/api/health"

                            if curl -fsS "http://${URL}/api/health"; then
                                echo "Production smoke test passed."
                                exit 0
                            fi
                        else
                            echo "Production LoadBalancer hostname not available yet."
                        fi

                        sleep 10
                    done

                    echo "Production smoke test failed."
                    exit 1
                '''
            }
        }
    }
}
