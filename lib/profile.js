const { apiGet } = require("./api");

async function getProfile() {
  return apiGet("/me", {
    fields: "id,username,name,account_type,media_count,profile_picture_url",
  });
}

async function getMyPosts(limit = 10) {
  return apiGet("/me/media", {
    fields: "id,caption,media_type,media_url,thumbnail_url,timestamp,permalink",
    limit: String(limit),
  });
}

async function getPost(mediaId) {
  return apiGet(`/${mediaId}`, {
    fields: "id,caption,media_type,media_url,thumbnail_url,timestamp,permalink,like_count,comments_count",
  });
}

module.exports = { getProfile, getMyPosts, getPost };
