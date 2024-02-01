pipeline {
    agent any
    
    tools {
	nodejs 'my_node'
    }

    environment {
    GITNAME = 'ks3ppp'            
    GITEMAIL = 'ks3ppp@gmail.com' 
    GITWEBADD = 'https://github.com/chanjin9703/auth_server.git'
    GITSSHADD = 'git@github.com:hjk1996/aws-app-eks-manifests.git'
    GITCREDENTIAL = 'kcj_git'
    
    ECR_REPO_URL = '109412806537.dkr.ecr.us-east-1.amazonaws.com/app_cognito_auth'
    
    ECR_CREDENTIAL = 'kcj_aws'
}

        
    stages {
        
        stage('Checkout Github') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], extensions: [],
                userRemoteConfigs: [[credentialsId: GITCREDENTIAL, url: GITWEBADD]]])
            }

            post {
                failure {
                    echo '리포지토리 복제 실패'
                }
                success {
                    echo '리포지토리 복제 성공'
                }
            }
        }
        

   
        stage('image build') {
            steps {
                sh "docker build -t ${ECR_REPO_URL}:${currentBuild.number} ."
                sh "docker build -t ${ECR_REPO_URL}:latest ."
            }
        }
        
        stage('image push') {
            steps {
                // AWS ECR에 로그인
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY', credentialsId: ECR_CREDENTIAL]]) {
                    script {
                        def ecrLogin = sh(script: "aws ecr get-login-password --region us-east-1", returnStdout: true).trim()
                        sh "docker login -u AWS -p ${ecrLogin} ${ECR_REPO_URL}"
                    }
                }

                // 이미지를 AWS ECR로 푸시
                sh "docker push ${ECR_REPO_URL}:${currentBuild.number}"
                sh "docker push ${ECR_REPO_URL}:latest"
            }
            
            post {
                failure {
                    echo 'AWS ECR로 이미지 푸시 실패'
                    sh "docker image rm -f ${ECR_REPO_URL}:${currentBuild.number}"
                    sh "docker image rm -f ${ECR_REPO_URL}:latest"
                }
                
                success {
                    echo 'AWS ECR로 이미지 푸시 성공'
                    sh "docker image rm -f ${ECR_REPO_URL}:${currentBuild.number}"
                    sh "docker image rm -f ${ECR_REPO_URL}:latest"
                }
            }
        }
	stage('k8s manifest file update') {
      	   steps {
        	git credentialsId: GITCREDENTIAL,
            	url: GITSSHADD,
            	branch: 'main'
        
       		 // 이미지 태그 변경 후 메인 브랜치에 푸시
       		sh "git config --global user.email ${GITEMAIL}"
        	sh "git config --global user.name ${GITNAME}"
        	sh "sed -i 's@${ECR_REPO_URL}:.*@${ECR_REPO_URL}:${currentBuild.number}@g' ingress/auth_group/auth_backend/auth-dep.yml"
        
        	sh "git add ."
        	sh "git commit -m 'fix:${ECR_REPO_URL} ${currentBuild.number} image versioning'"
        	sh "git branch -M main"
        	sh "git remote remove origin"
        	sh "git remote add origin ${GITSSHADD}"
        	sh "git push -u origin main"

      	   }
      	   post {
        	failure {
          	echo 'k8s manifest file update failure'
        	}
        	success {
          	echo 'k8s manifest file update success'  
        	}
      	   }
    	 }    
    }
}
