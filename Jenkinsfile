
@Library('jenkins-shared-library@main') _

pipeline {

    agent {
        label 'jenkins-agent'
    }

    environment {
        CI = 'false'
        GIT_CREDENTIALS = 'jennkins-to-github'
        KUBECONFIG_ID = 'kubeconfig'
        KUBECONFIG_ID_QAQC = 'kubeconfig-qaqc'
        FILENAME = 'cbs-ui-deploy-service.yaml'
        FILENAME_QAQC = 'uat-cbs-ui-deploy-service.yaml'
        MICROSERVICE = 'EnfiniteCBS_UI'
        IMAGE_NAME = 'acuteinformatics2024/enfinitycore-dev'
        IMAGE_NAME_QAQC = 'acuteinformatics2024/enfinitycore-uat'
        EMAIL_RECIPIENT = 'is-team@bankaiinformatics.co.in,aipl-devops@bankaiinformatics.co.in,jayendra.sathwara@bankaiinformatics.co.in,sajid.sachawala@bankaiinformatics.co.in,parag.mistri@bankaiinformatics.co.in,pradeep.suthar@bankaiinformatics.co.in,aditya.shah@bankaiinformatics.co.in'
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
            checkout scm
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

    stage('Extract and Increment Image Tag in develop') {
        when {
            branch 'develop'
        }
        steps {
            extractIncreamentForFiveDigit(env.FILENAME)
        }
    }

    stage('Extract and Increment Image Tag in quality') {
        when {
            branch 'quality'
        }
        steps {
           extractIncreamentForFiveDigit(env.FILENAME_QAQC)
        }
    }

    stage('Build and Push Docker Image To develop branch') {
        when {
            branch 'develop'
        }
        steps {
            buildAndPushDockerImage(env.IMAGE_NAME, env.NEW_TAG)
        }
    }

    stage('Build and Push Docker Image To quality branch') {
        when {
            branch 'quality'
        }
        steps {
            buildAndPushDockerImage(env.IMAGE_NAME_QAQC, env.NEW_TAG)
        }
    }

    stage('Update Manifest To develop branch') {
        when {
            branch 'develop'
        }
        steps {
            updateManifestDeploy(env.FILENAME, env.NEW_TAG, env.IMAGE_NAME)
        }
    }

    stage('Update Manifest To quality branch') {
        when {
            branch 'quality'
        }
        steps {
            updateManifestDeploy(env.FILENAME_QAQC, env.NEW_TAG, env.IMAGE_NAME_QAQC)
        }
    }

    stage('Push Deployment File to develop git branch') {
        when {
            branch 'develop'
        }
        steps {
            pushDeploymentFileToGit(env.FILENAME, env.NEW_TAG, env.BRANCH_NAME, env.GIT_CREDENTIALS, env.GIT_URL)
        }
    }

    stage('Push Deployment File to quality git branch') {
        when {
            branch 'quality'
        }
        steps {
            pushDeploymentFileToGit(env.FILENAME_QAQC, env.NEW_TAG, env.BRANCH_NAME, env.GIT_CREDENTIALS, env.GIT_URL)
        }
    }

    stage('Deploy To Kubernetes - DEV') {
        when {
            branch 'develop'
        }
        steps {
            deployToKubernetes(env.FILENAME, env.KUBECONFIG_ID)
        }
    }

    stage('Deploy To Kubernetes - quality') {
        when {
            branch 'quality'
        }
        steps {
            deployToKubernetes(env.FILENAME_QAQC, env.KUBECONFIG_ID_QAQC)
        }
    }

            // stage('Trivy Image Scan') {
        //     steps {
        //         sh 'trivy image ${IMAGE_NAME}:${NEW_TAG} --format table -o ${MICROSERVICE}.txt '
        //     }
        // }
}



    post {
        success {
            notification('SUCCESS', env.EMAIL_RECIPIENT)
        }
        failure {
            notification('FAILURE', env.EMAIL_RECIPIENT)
        }
    }    
}
    
