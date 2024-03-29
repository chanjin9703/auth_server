const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

require('dotenv').config();
//경로 파일 
const routes = require("./routes.js");

//http 서버생성, express app 생성
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//서버 시작 port 4000, localhost
try {
  app.listen(4000, () => {
    console.log("Server running");
  });

  app.use("/", routes); // /경로로들어오는요청 routes.js파일에 있는 경로로이동
  
} catch (err) {
  console.log("error", err);
}
const onClose = () => {
  process.exit();
};

// ctrl+c 종료시 프로그램종료
process.on("SIGTERM", onClose);
process.on("SIGINT", onClose);
process.on("uncaughtException", onClose);
