const express = require('express');
//router 객체생성, app 앤드포인트관리, 요청처리
const router = express.Router();

const cognito = require('./cognito.js');

router.post('/signup', async (req,res)=> {
    const {body} = req;

    //필요한 포멧 정의.
    let {email,name,password, confirmpassword} = body;

    try {

      if (password !== confirmpassword) {
        throw new Error("Passwords do not match");
      }
      //cognito 모듈사용, 회원가입처리
      let result = await cognito.signUp(name,email,password, confirmpassword);
      //성공시 응답반환
      let response = {
        name : name,
        username : result.user.username,
        id: result.userSub,
        success: true
      }
      
      res.status(200).json({"result": response});

    } catch(err){
      //에러

      res.status(400).json({"error":err});
    }              
                
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

//비밀번호변경
router.post('/changePwd', async (req,res)=> {

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


module.exports = router;
