const { apiGet, apiPost } = require("./api");
const { startTunnel, stopTunnel } = require("./tunnel");
const http = require("http");
const fs = require("fs");
const path = require("path");

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

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

function validateImageFile(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`파일을 찾을 수 없습니다: ${absolutePath}`);
  }
  const ext = path.extname(absolutePath).toLowerCase();
  const mimeType = MIME_TYPES[ext];
  if (!mimeType) {
    throw new Error(
      `지원하지 않는 이미지 형식입니다: ${ext} (지원: jpg, png, gif, webp)`
    );
  }
  return { absolutePath, mimeType };
}

function createFileServer(fileMap) {
  return http.createServer((req, res) => {
    const fileName = decodeURIComponent(req.url.replace(/^\//, ""));
    const entry = fileMap.get(fileName);
    if (entry) {
      res.writeHead(200, {
        "Content-Type": entry.mimeType,
        "Content-Length": entry.data.length,
      });
      res.end(entry.data);
    } else {
      res.writeHead(404);
      res.end();
    }
  });
}

async function startLocalTunnel(fileMap) {
  const server = createFileServer(fileMap);
  const port = await new Promise((resolve) => {
    server.listen(0, () => resolve(server.address().port));
  });
  console.log(`로컬 서버 시작 (포트: ${port})`);

  console.log("cloudflared 터널 시작 중...");
  const publicUrl = await startTunnel(port);
  console.log(`공개 URL 획득: ${publicUrl}`);

  return { server, publicUrl };
}

async function postLocalImage(filePath, caption) {
  const { absolutePath, mimeType } = validateImageFile(filePath);
  const fileName = path.basename(absolutePath);
  const fileMap = new Map([
    [fileName, { data: fs.readFileSync(absolutePath), mimeType }],
  ]);

  let server = null;
  try {
    const tunnel = await startLocalTunnel(fileMap);
    server = tunnel.server;
    const result = await postImage(`${tunnel.publicUrl}/${fileName}`, caption);
    return result;
  } finally {
    stopTunnel();
    if (server) server.close();
    console.log("서버 및 터널 종료 완료");
  }
}

async function waitForContainer(containerId) {
  while (true) {
    const status = await apiGet(`/${containerId}`, {
      fields: "status_code",
    });
    if (status.status_code === "FINISHED") return;
    if (status.status_code === "ERROR") {
      throw new Error(`미디어 컨테이너 처리 실패: ${containerId}`);
    }
    await sleep(3000);
  }
}

async function postCarousel(imageUrls, caption) {
  const userId = await getMyUserId();

  // 1단계: 개별 이미지 컨테이너 생성
  const childIds = [];
  for (let i = 0; i < imageUrls.length; i++) {
    console.log(`이미지 ${i + 1}/${imageUrls.length} 컨테이너 생성 중...`);
    const container = await apiPost(`/${userId}/media`, {
      image_url: imageUrls[i],
      is_carousel_item: true,
    });
    childIds.push(container.id);
    console.log(`  컨테이너 생성 완료: ${container.id}`);
  }

  // 2단계: 각 컨테이너 상태 폴링
  console.log("업로드 처리 대기 중...");
  for (const id of childIds) {
    await waitForContainer(id);
  }

  // 3단계: 캐러셀 컨테이너 생성
  console.log("캐러셀 컨테이너 생성 중...");
  const carousel = await apiPost(`/${userId}/media`, {
    media_type: "CAROUSEL",
    children: childIds.join(","),
    caption,
  });
  console.log(`캐러셀 컨테이너: ${carousel.id}`);

  // 4단계: 캐러셀 상태 폴링
  await waitForContainer(carousel.id);

  // 5단계: 발행
  console.log("캐러셀 게시물 발행 중...");
  const result = await apiPost(`/${userId}/media_publish`, {
    creation_id: carousel.id,
  });
  console.log(`게시 완료! ID: ${result.id}`);
  return result;
}

async function postLocalCarousel(filePaths, caption) {
  const fileMap = new Map();
  const fileNames = [];

  for (const fp of filePaths) {
    const { absolutePath, mimeType } = validateImageFile(fp);
    const fileName = path.basename(absolutePath);
    fileMap.set(fileName, { data: fs.readFileSync(absolutePath), mimeType });
    fileNames.push(fileName);
  }

  let server = null;
  try {
    const tunnel = await startLocalTunnel(fileMap);
    server = tunnel.server;

    const imageUrls = fileNames.map((f) => `${tunnel.publicUrl}/${f}`);
    const result = await postCarousel(imageUrls, caption);
    return result;
  } finally {
    stopTunnel();
    if (server) server.close();
    console.log("서버 및 터널 종료 완료");
  }
}

module.exports = { postImage, postLocalImage, postCarousel, postLocalCarousel };
