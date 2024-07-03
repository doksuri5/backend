import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import connectDB from "./database/db.js";

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
app.use(cookieParser());

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

// 서버 연결
app.listen(8080, () => {
  console.log("백엔드 서버 연결");
});
