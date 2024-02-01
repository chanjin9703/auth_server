//cognito 상호작용위해 필요패키지
const AmazonCognitoId = require("amazon-cognito-identity-js");

const AWS = require("aws-sdk"); //aws 서비스사용패키지
const request = require("request"); //http요청
//jwt 사용 패키지
const jwkToPem = require("jwk-to-pem"); 
const jwt = require("jsonwebtoken");
const axios = require('axios');

const userPoolId = process.env.userPoolId;
const clientId = process.env.clientId;

const poolData = {
  UserPoolId: userPoolId,
  ClientId: clientId
};

const aws_region = "us-east-1";

const CognitoUserPool = AmazonCognitoId.CognitoUserPool;
var CognitoRefreshToken = AmazonCognitoId.CognitoRefreshToken;
const userPool = new AmazonCognitoId.CognitoUserPool(poolData);

//cognito 회원가입
const signUp = (email, password) => {
    return new Promise((result, reject) => {
        try {
            //사용자 속성리스트
            const attributeList =[];

            //user 이름,이메일 설정
            attributeList.push(
                new AmazonCognitoId.CognitoUserAttribute({
                    Name: "email",
                    Value: email
                })
            );
          


        //cognito에 새 user 등록.
        userPool.signUp(email, password, attributeList, null, (err, data) => {
            if (err) reject(err); // 에러발생시 거부
            else result(data); //성공시 데이터 반환
        });
    } catch(err) {
      reject(err);
    }
  });
};


//이메일 인증

const verifyCode = (username, code) => {
    return new Promise((resolve, reject) => {
        const userPool = new AmazonCognitoId.CognitoUserPool(poolData);
        const userData = {
            Username: username,
            Pool: userPool
        };

        const cognitoUser = new AmazonCognitoId.CognitoUser(userData);
        cognitoUser.confirmRegistration(code, true, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

// 로그인/토큰반환
const logIn = (name, password) => {
    return new Promise((resolve, reject) => {
        try {
            //사용자 인증정보생성
            const authenticationDetails = new AmazonCognitoId.AuthenticationDetails({
                Username: name,
                Password: password
            });
            //사용자 데이터설정
            const userData = {
                Username: name,
                Pool: userPool
            };

            const cognitoUser = new AmazonCognitoId.CognitoUser(userData);

            //사용자인증
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: result => {
                    resolve({
                        accesToken: result.getAccessToken().getJwtToken(),
                        idToken: result.getIdToken().getJwtToken(),
                        refreshToken: result.getRefreshToken().getToken(),
			username : name
                    });
                },
                onFailure: err => {
                    reject(err);
                }
            });
        } catch(err) {
          reject(err);
        }
    });
};

//로그아웃
const logout = () => {
    return new Promise((resolve, reject) => {
        try {
            const cognitoUser = userPool.getCurrentUser();

            if (cognitoUser) {
                cognitoUser.signOut();
                resolve("Logout successful");
            } else {
                reject("No user is currently signed in");
            }
        } catch (error) {
            reject(error);
        }
    });
};



//토큰갱신
async function refreshTokens(username,refreshToken) {
    try {
        const userData = {
            Username: username,
            Pool: userPool
        };

        const cognitoUser = new AmazonCognitoId.CognitoUser(userData);
        
        const token = new CognitoRefreshToken({RefreshToken: refreshToken});
        
        const session = await new Promise((resolve, reject) => {
            cognitoUser.refreshSession(token, function (err, session) {
                if (err) {
                    reject(err);
                } else {
                    resolve(session);
                }
            });
        });
        const idToken = session.getIdToken().getJwtToken();
        const accessToken = session.getAccessToken().getJwtToken();

        return { idToken, accessToken};
    } catch (error) {
        console.log(error);
    }
}




// 비밀번호 변경
const changePwd = (username, password, newpassword)=> {
    return new Promise((resolve, reject) => {
        const authenticationDetails = new AmazonCognitoId.AuthenticationDetails({
            Username: username,
            Password: password
        });

        const userData = {
            Username: username,
            Pool: userPool
        };

        const cognitoUser = new AmazonCognitoId.CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: result => {
                cognitoUser.changePassword(password, newpassword, (err, result) => {
                  if (err) reject(err);
                  else resolve(result);   
                });
            },
            onFailure: err => {
                reject(err);
            }
        });
    });
};

module.exports.logout = logout;
module.exports.refreshTokens = refreshTokens;
module.exports.changePwd = changePwd;
module.exports.logIn = logIn;
module.exports.verifyCode = verifyCode;
module.exports.signUp = signUp;
