import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import MongoStore from "connect-mongo";
import morgan from "morgan";

import connectDB from "./database/db.js";
import { CronJob } from "cron";
import { main } from "./cron-job/search-news-db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: path.join(__dirname, "./.env.production") });
} else if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: path.join(__dirname, "./.env.development") });
}

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

if (process.env.NODE_ENV === "development") {
  morgan.token("headers", (req) => JSON.stringify(req.headers, null, 2));
  morgan.token("body", (req) => JSON.stringify(req.body, null, 2));

  app.use(morgan(":method :url :status :res[content-length] - :response-time ms\nHeaders: :headers\nBody: :body\n"));
}

app.use(cookieParser(process.env.COOKIE_SECRET));
const sessionOption = {
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    httpOnly: true,
    secure: false, // 배포시 true
  },
};

if (process.env.NODE_ENV === "production") {
  sessionOption.proxy = true;
  sessionOption.cookie.secure = true;
}
app.use(session(sessionOption));

// routes 파일들을 모두 읽어서 각각을 Express 앱에 등록
const routesPath = path.join(__dirname, "/routes"); // routes 파일들이 있는 디렉토리 경로
const routeFiles = fs.readdirSync(routesPath);

for (const file of routeFiles) {
  const filePath = pathToFileURL(path.join(routesPath, file)).href;
  import(filePath)
    .then((module) => {
      const route = module.default;
      app.use("/api", route);
    })
    .catch((err) => {
      console.error(`Failed to load route ${filePath}:`, err);
    });
}

// DB 연결
connectDB();

// 작업 정의
const executeTask = async () => {
  console.log("===================================================");
  console.log(await main());
};

// await executeTask();

// (async () => {
//   await executeTask();

//   const job = new CronJob(
//     "*/1 * * * *",
//     executeTask,
//     () => {
//       console.log("작업이 완료되었습니다.");
//     },
//     true, // true일 경우 서버가 재시작 되면 자동으로 다시 실행
//     "Asia/Seoul"
//   );

//   job.start();
// })();

// 서버 연결
app.listen(8080, () => {
  console.log("백엔드 서버 연결");
});
