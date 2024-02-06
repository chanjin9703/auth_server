const express = require('express');
//router 객체생성, app 앤드포인트관리, 요청처리
const router = express.Router();

const cognito = require('./cognito.js');

router.post('/signup', async (req,res)=> {
    const {body} = req;

    //필요한 포멧 정의.
    let {email,password} = body;

    try {

      
      //cognito 모듈사용, 회원가입처리
      let result = await cognito.signUp(email,password);
      //성공시 응답반환
      let response = {
        username : result.user.username,
        id: result.userSub,
        success: true
      }
      
      res.status(200).json({"result": response});

    } catch(err){
      //에러

      res.status(400).json({"error":err});
    }              
/*
    } else {
        res.status(400).json({"error": "bad format"});
    }*/                
});

//이메일인증
router.post('/email', async (req,res)=> {

  const {body} = req;

  if (body.email&&body.code) {

    const {email,code} = body;

    try {

      let result = await cognito.verifyCode(email,code);
      res.status(200).json({"result":result});
    } catch(error){
      console.log(error);
      res.status(400).json({"error":error});
    }
  } else {
    res.status(400).json({"error": "bad format"});
  }
});

//로그인
router.post('/login', async (req,res)=> {

  const {body} = req;

  if (body.email&&body.password) {

    const {email,password} = body;

    try {

      let result = await cognito.logIn(email, password);

      res.status(200).json({ result: result});
    } catch(error){
      res.status(400).json({"error":error});
    }
  } else {
    res.status(400).json({"error": "bad format"});
  }
});

//로그아웃
router.post('/logout', async (req, res) => {
  try {
    await cognito.logout();
    res.status(200).json({ message: "Logout successful"});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message});
  }
});

//refresh token 사용해서 access,id token 갱신
router.post('/refresh', async (req, res) => {
  const { body } = req;
  if (body.refresh_token) {
    const { refresh_token, username } = body;
    
   
    try {
        let result = await cognito.refreshTokens(username,refresh_token);
        res.status(200).json(result);
    } catch (error) {
        console.error(response);
        res.status(400).json({ "error": error});
    }
  } else {
      
      res.status(400).json({ "error": "refreshToken is required"});
  }
});

//비밀번호변경
router.post('/changepwd', async (req,res)=> {

  const {body} = req;

  if (body.email&&body.password && body.newpassword) {

    let { email, password, newpassword} = body;

    try {

      let result = await cognito.changePwd(email, password, newpassword);

      res.status(200).json({ result: result});
    } catch(error){
      console.log(error);
      res.status(400).json({"error":error});
    }
  } else {
    res.status(400).json({"error": "bad format"});
  }
});

router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;

  if (email) {
    try {
      await cognito.forgotPassword(email);
      res.status(200).json({ message: '이메일로 인증코드가 발송되었습니다.'});
    } catch (error) {
      console.error('비밀번호 재설정 요청 실패:', error);
      res.status(400).json({ error: '비밀번호 재설정 요청 실패.'});
    }
  } else {
    res.status(400).json({ error: '이메일 주소를 입력하세요'});
  }
});

router.post('/resetpassword', async (req, res) => {
  const { email, code, newPassword} = req.body;

  if (email && code && newPassword) {
    try {
      await cognito.resetPassword(email, code, newPassword);
      res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.'});
    } catch (error) {
      console.error('비밀번호 재설정 실패:',error);
      res.status(400).json({ error: '비밀번호 재설정 실패'});
    }
  } else {
    res.status(400).json({ error: '이메일 주소, 인증코드 , new password를 입력하세요'});
  }
});

module.exports = router;
