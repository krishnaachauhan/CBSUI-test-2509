pipeline {
    
    agent {
        label 'jenkins-agent'
    }

    environment {
        CI = 'false'
        GIT_REPO_URL = 'https://github.com/krishnaachauhan/CBSUI-test-2509.git'
        GIT_CREDENTIALS = 'krishnaachauhan'
        KUBECONFIG_ID = 'kubeconfig'
        FILENAME = 'cbs-ui-deploy-service.yaml'
        MICROSERVICE = 'EnfiniteCBS_UI'
        BRANCH = 'main'
        IMAGE_NAME = 'actdocker123/cicdpipeline'
        EMAIL_RECIPIENT = 'krishna.chauhan@bankaiinformatics.co.in'
    }

    tools {
        nodejs 'nodejs20'
    }

    stages {
        stage('Cleanup Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${env.BRANCH}"]],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [],
                    userRemoteConfigs: [[
                        url: env.GIT_REPO_URL,
                        credentialsId: env.GIT_CREDENTIALS
                    ]]
                ])
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install --force'
                sh 'yarn add cross-env'
            }
        }

        stage('Build') {
            environment {
                CI = 'false'
            }
            steps {
                sh 'npm run build'
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'build/**', allowEmptyArchive: true
            }
        }

        stage('Extract and Increment Image Tag') {
            steps {
                script {
                    def latestTag = sh(script: "git tag | grep -Eo '\\d{5}' | sort -nr | head -n1", returnStdout: true).trim()
                    def newTag = latestTag.isNumber() ? String.format("%05d", latestTag.toInteger() + 1) : "00001"
                    env.NEW_TAG = newTag
                    echo "New image tag: ${env.NEW_TAG}"
                }
            }
        }

        stage('Build and Push Docker Image') {
            steps {
                script {
                    sh """
                        docker build -t ${env.IMAGE_NAME}:${env.NEW_TAG} .
                        docker push ${env.IMAGE_NAME}:${env.NEW_TAG}
                    """
                }
            }
        }

        stage('Update Manifest') {
            steps {
                script {
                    sh """
                        sed -i 's|image:.*|image: ${env.IMAGE_NAME}:${env.NEW_TAG}|' ${env.FILENAME}
                    """
                }
            }
        }

        stage('Push Deployment File to Git') {
            steps {
                script {
                    sh """
                        git config user.name "jenkins"
                        git config user.email "jenkins@yourdomain.com"
                        git add ${env.FILENAME}
                        git commit -m "Update image tag to ${env.NEW_TAG}"
                        git push https://${env.GIT_CREDENTIALS}@${env.GIT_REPO_URL.replace('https://', '')} HEAD:${env.BRANCH}
                    """
                }
            }
        }

        // stage('Deploy To Kubernetes') {
        //     steps {
        //         withCredentials([file(credentialsId: env.KUBECONFIG_ID, variable: 'KUBECONFIG')]) {
        //             sh 'kubectl apply -f ${FILENAME}'
        //         }
        //     }
        // }

        // stage('Trivy Image Scan') {
        //     steps {
        //         sh 'trivy image ${IMAGE_NAME}:${NEW_TAG} --format table -o ${MICROSERVICE}.txt'
        //     }
        // }
    }

    post {
        success {
            script {
                emailext(
                    subject: "✅ Build SUCCESS: ${env.JOB_NAME} [#${env.BUILD_NUMBER}]",
                    body: "The pipeline completed successfully.\n\nBuild URL: ${env.BUILD_URL}",
                    to: "${env.EMAIL_RECIPIENT}"
                )
            }
        }

        failure {
            script {
                emailext(
                    subject: "❌ Build FAILURE: ${env.JOB_NAME} [#${env.BUILD_NUMBER}]",
                    body: "The pipeline failed.\n\nBuild URL: ${env.BUILD_URL}",
                    to: "${env.EMAIL_RECIPIENT}"
                )
            }
        }
    }
}
