const { apiGet, apiPost } = require("./api");

async function getComments(mediaId) {
  return apiGet(`/${mediaId}/comments`, {
    fields: "id,text,username,timestamp,replies{id,text,username,timestamp}",
  });
}

async function postComment(mediaId, text) {
  const result = await apiPost(`/${mediaId}/comments`, { message: text });
  console.log(`댓글 작성 완료: ${result.id}`);
  return result;
}

async function replyToComment(commentId, text) {
  const result = await apiPost(`/${commentId}/replies`, { message: text });
  console.log(`답글 작성 완료: ${result.id}`);
  return result;
}

module.exports = { getComments, postComment, replyToComment };
