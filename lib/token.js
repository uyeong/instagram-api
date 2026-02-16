const fs = require("fs");
const path = require("path");
const { config, updateAccessToken } = require("./config");

async function refreshToken() {
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${config.accessToken}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(`토큰 갱신 실패: ${data.error.message}`);
  }

  const newToken = data.access_token;
  const expiresInDays = Math.floor(data.expires_in / 86400);

  // 런타임 토큰 교체
  updateAccessToken(newToken);

  // .env 파일에 저장
  const envPath = path.join(__dirname, "..", ".env");
  let envContent = fs.readFileSync(envPath, "utf-8");
  envContent = envContent.replace(
    /INSTAGRAM_ACCESS_TOKEN=.*/,
    `INSTAGRAM_ACCESS_TOKEN=${newToken}`
  );
  fs.writeFileSync(envPath, envContent);

  console.log(`토큰 갱신 완료 (만료: ${expiresInDays}일 후)`);
  return data;
}

module.exports = { refreshToken };
