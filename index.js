const AWS = require('aws-sdk');

// AWS 계정 자격 증명 구성
AWS.config.update({
  region: 'us-east-1', // 사용하는 AWS 리전
});

// DynamoDB 클라이언트 생성
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// DynamoDB 테이블 이름
const tableName = 'UserPoolTable';

// Lambda 함수의 진입점으로 exports.handler 정의
exports.handler = async (event, context) => {
  try {
    // event 객체에서 필요한 정보 추출
    const { sub, email } = event.request.userAttributes;
   // 현재 시간을 ISO 형식으로 가져오기    
    const currentTime = new Date().toISOString();

    // DynamoDB에 저장할 아이템
    const params = {
      TableName: tableName,
      Item: {
        id: sub,
        email: email, // 사용자 이메일
        createdAt: currentTime
      }
    };

    // DynamoDB에 아이템 추가
    await dynamoDb.put(params).promise();

    console.log('User information saved to DynamoDB successfully.');
  } catch (error) {
    console.error('Error saving user information to DynamoDB:', error);
  }
};
