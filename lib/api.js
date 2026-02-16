const { config } = require("./config");

async function apiGet(endpoint, params = {}) {
  params.access_token = config.accessToken;
  const query = new URLSearchParams(params).toString();
  const url = `${config.baseUrl}${endpoint}?${query}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(`API 오류: ${data.error.message}`);
  }
  return data;
}

async function apiPost(endpoint, body = {}) {
  body.access_token = config.accessToken;

  const res = await fetch(`${config.baseUrl}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (data.error) {
    throw new Error(`API 오류: ${data.error.message}`);
  }
  return data;
}

module.exports = { apiGet, apiPost };
