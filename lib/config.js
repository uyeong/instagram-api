require("dotenv").config();

const config = {
  appId: process.env.INSTAGRAM_APP_ID,
  appSecret: process.env.INSTAGRAM_APP_SECRET,
  accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
  baseUrl: "https://graph.instagram.com/v24.0",
};

function updateAccessToken(newToken) {
  config.accessToken = newToken;
}

module.exports = { config, updateAccessToken };
