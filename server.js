require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const connectDB = require("./database/db.js");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const routesPath = path.join(__dirname, "/routes"); // routes 파일들이 있는 디렉토리 경로

// routes 파일들을 모두 읽어서 각각을 Express 앱에 등록
fs.readdirSync(routesPath).forEach((file) => {
  const route = require(path.join(routesPath, file));
  app.use("/api", route);
});

// DB 연결
connectDB();

// 서버 연결
app.listen(8080, () => {
  console.log("백엔드 서버 연결");
});
