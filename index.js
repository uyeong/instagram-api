const readline = require("readline");
const { refreshToken } = require("./lib/token");
const { getProfile, getMyPosts, getPost } = require("./lib/profile");
const { postImage } = require("./lib/media");
const { getComments, postComment, replyToComment } = require("./lib/comments");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function showMenu() {
  console.log("\n=== Instagram API CLI ===");
  console.log("1. 프로필 보기");
  console.log("2. 내 게시물 목록");
  console.log("3. 이미지 게시");
  console.log("4. 게시물 댓글 보기");
  console.log("5. 댓글 작성");
  console.log("6. 댓글에 답글");
  console.log("7. 토큰 갱신");
  console.log("0. 종료");
}

async function handleProfile() {
  const profile = await getProfile();
  console.log("\n--- 프로필 ---");
  console.log(`이름: ${profile.name || "-"}`);
  console.log(`사용자명: ${profile.username}`);
  console.log(`계정 유형: ${profile.account_type}`);
  console.log(`게시물 수: ${profile.media_count}`);
}

async function handlePosts() {
  const limit = await ask("조회할 개수 (기본 10): ");
  const posts = await getMyPosts(Number(limit) || 10);

  console.log("\n--- 게시물 목록 ---");
  if (!posts.data || posts.data.length === 0) {
    console.log("게시물이 없습니다.");
    return;
  }
  posts.data.forEach((post, i) => {
    const caption = post.caption
      ? post.caption.substring(0, 50) + (post.caption.length > 50 ? "..." : "")
      : "(캡션 없음)";
    console.log(`${i + 1}. [${post.media_type}] ${caption}`);
    console.log(`   ID: ${post.id} | ${post.timestamp}`);
  });
}

async function handlePostImage() {
  const imageUrl = await ask("이미지 URL: ");
  const caption = await ask("캡션: ");

  if (!imageUrl.trim()) {
    console.log("이미지 URL을 입력해주세요.");
    return;
  }
  await postImage(imageUrl.trim(), caption);
}

async function handleComments() {
  const mediaId = await ask("게시물 ID: ");
  if (!mediaId.trim()) {
    console.log("게시물 ID를 입력해주세요.");
    return;
  }

  const comments = await getComments(mediaId.trim());
  console.log("\n--- 댓글 ---");
  if (!comments.data || comments.data.length === 0) {
    console.log("댓글이 없습니다.");
    return;
  }
  comments.data.forEach((c, i) => {
    console.log(`${i + 1}. @${c.username}: ${c.text} (${c.timestamp})`);
    console.log(`   댓글 ID: ${c.id}`);
    if (c.replies && c.replies.data) {
      c.replies.data.forEach((r) => {
        console.log(`   ↳ @${r.username}: ${r.text}`);
      });
    }
  });
}

async function handlePostComment() {
  const mediaId = await ask("게시물 ID: ");
  const text = await ask("댓글 내용: ");
  if (!mediaId.trim() || !text.trim()) {
    console.log("게시물 ID와 댓글 내용을 입력해주세요.");
    return;
  }
  await postComment(mediaId.trim(), text.trim());
}

async function handleReply() {
  const commentId = await ask("댓글 ID: ");
  const text = await ask("답글 내용: ");
  if (!commentId.trim() || !text.trim()) {
    console.log("댓글 ID와 답글 내용을 입력해주세요.");
    return;
  }
  await replyToComment(commentId.trim(), text.trim());
}

const handlers = {
  1: handleProfile,
  2: handlePosts,
  3: handlePostImage,
  4: handleComments,
  5: handlePostComment,
  6: handleReply,
  7: refreshToken,
};

async function main() {
  console.log("Instagram API CLI 시작...");

  // 시작 시 토큰 자동 갱신
  try {
    await refreshToken();
  } catch (err) {
    console.error("토큰 갱신 실패:", err.message);
    console.log("기존 토큰으로 계속합니다.\n");
  }

  while (true) {
    showMenu();
    const choice = await ask("\n선택: ");

    if (choice === "0") {
      console.log("종료합니다.");
      rl.close();
      break;
    }

    const handler = handlers[choice];
    if (!handler) {
      console.log("잘못된 선택입니다.");
      continue;
    }

    try {
      await handler();
    } catch (err) {
      console.error(`오류: ${err.message}`);
    }
  }
}

main();
