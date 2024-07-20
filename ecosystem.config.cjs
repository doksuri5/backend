module.exports = {
  apps: [
    {
      name: "aightnow",
      script: "./server.js", // ES 모듈 파일 확장자 .mjs 사용
      env_development: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
