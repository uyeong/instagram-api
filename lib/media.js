const { apiGet, apiPost } = require("./api");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getMyUserId() {
  const data = await apiGet("/me", { fields: "id" });
  return data.id;
}

async function postImage(imageUrl, caption) {
  const userId = await getMyUserId();

  // 1단계: 컨테이너 생성
  console.log("컨테이너 생성 중...");
  const container = await apiPost(`/${userId}/media`, {
    image_url: imageUrl,
    caption,
  });
  const containerId = container.id;
  console.log(`컨테이너 생성 완료: ${containerId}`);

  // 2단계: 상태 폴링
  console.log("업로드 처리 대기 중...");
  while (true) {
    const status = await apiGet(`/${containerId}`, {
      fields: "status_code",
    });

    if (status.status_code === "FINISHED") {
      break;
    }
    if (status.status_code === "ERROR") {
      throw new Error("미디어 컨테이너 처리 실패");
    }
    await sleep(3000);
  }

  // 3단계: 발행
  console.log("게시물 발행 중...");
  const result = await apiPost(`/${userId}/media_publish`, {
    creation_id: containerId,
  });
  console.log(`게시 완료! ID: ${result.id}`);
  return result;
}

module.exports = { postImage };
