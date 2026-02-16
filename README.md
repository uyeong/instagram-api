# instagram-api

An [Agent Skills](https://agentskills.io) skill for managing an Instagram account. Works with both **Claude Code** and **OpenAI Codex**.

Agents execute individual scripts under `scripts/` and interpret JSON results — no interactive CLI involved.

## Features

- View profile and posts
- Publish single images or carousels (up to 10)
- Post from URLs or local files (via cloudflared tunnel)
- HEIC/HEIF auto-conversion to JPEG
- Read, write, and reply to comments
- Automatic token refresh on every command

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure credentials

```bash
cp .env.example .env
```

Fill in your `.env`:

```
INSTAGRAM_APP_ID=<your-app-id>
INSTAGRAM_APP_SECRET=<your-app-secret>
INSTAGRAM_ACCESS_TOKEN=<your-access-token>
```

To obtain these credentials:

1. Create a **Meta App** at [developers.facebook.com](https://developers.facebook.com/) and add the **Instagram** product.
2. In the App Dashboard, find your **App ID** and **App Secret** under App Settings > Basic.
3. Generate a **short-lived access token** via the Instagram Graph API Explorer or the Token Generator in the App Dashboard.
4. Exchange it for a **long-lived access token** (valid for 60 days, auto-refreshed by this skill):
   ```
   GET https://graph.instagram.com/access_token
     ?grant_type=ig_exchange_token
     &client_secret=<APP_SECRET>
     &access_token=<SHORT_LIVED_TOKEN>
   ```

### 3. Install cloudflared (for local image posting)

```bash
# macOS
brew install cloudflared

# Ubuntu / Debian
curl -L -o cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-$(dpkg --print-architecture).deb
sudo dpkg -i cloudflared.deb
```

## Install as a Skill

### Claude Code

```bash
ln -s "$(pwd)" ~/.claude/skills/instagram-api
```

Then use `/instagram-api` or let Claude invoke it automatically.

### OpenAI Codex

```bash
ln -s "$(pwd)" ~/.agents/skills/instagram-api
```

## Scripts

All scripts output JSON to stdout and logs to stderr.
All scripts support `--env <path>` to use a custom `.env` file.

| Script | Description |
|--------|-------------|
| `node scripts/get-profile.js` | View profile |
| `node scripts/get-posts.js [--limit N]` | List posts |
| `node scripts/get-post.js <media-id>` | View post detail |
| `node scripts/post-image.js --caption "..." <images>` | Publish image(s) |
| `node scripts/get-comments.js <media-id>` | View comments |
| `node scripts/post-comment.js <media-id> --text "..."` | Post comment |
| `node scripts/reply-comment.js <comment-id> --text "..."` | Reply to comment |
| `node scripts/refresh-token.js` | Manually refresh token |

### Image publishing examples

```bash
# Single image from URL
node scripts/post-image.js --caption "Hello" https://example.com/photo.jpg

# Single local image
node scripts/post-image.js --caption "Hello" ./photo.png

# Carousel from local files
node scripts/post-image.js --caption "Hello" ./a.png ./b.jpg ./c.heic
```

## Requirements

- Node.js v18+
- `cloudflared` — for local image posting only
- Instagram Graph API credentials (long-lived access token)

## Project Structure

```
instagram-api/
├── SKILL.md              # Skill entrypoint (agent instructions)
├── SPEC.md               # Technical specification
├── agents/
│   └── openai.yaml       # Codex config
├── scripts/
│   ├── _common.js        # Shared module (API, auth, tunnel, media)
│   ├── get-profile.js
│   ├── get-posts.js
│   ├── get-post.js
│   ├── post-image.js
│   ├── get-comments.js
│   ├── post-comment.js
│   ├── reply-comment.js
│   └── refresh-token.js
├── .env                  # Credentials (not committed)
└── package.json
```

---

# instagram-api (한국어)

Instagram 계정을 관리하는 [Agent Skills](https://agentskills.io) 스킬. **Claude Code**와 **OpenAI Codex** 모두에서 동작한다.

에이전트가 `scripts/` 하위의 개별 스크립트를 실행하고 JSON 결과를 해석하는 구조이다.

## 기능

- 프로필 및 게시물 조회
- 단일 이미지 또는 캐러셀 게시 (최대 10장)
- URL 또는 로컬 파일로 게시 (cloudflared 터널 사용)
- HEIC/HEIF 이미지 자동 JPEG 변환
- 댓글 조회, 작성, 답글
- 매 명령 실행 시 자동 토큰 갱신

## 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 인스타그램 자격 증명 발급 및 설정

이 스킬을 사용하려면 **Meta 앱**과 **Instagram 장기 액세스 토큰**이 필요하다.

#### Meta 앱 생성

1. [developers.facebook.com](https://developers.facebook.com/)에서 **Meta 앱**을 생성하고 **Instagram** 제품을 추가한다.
2. 앱 대시보드의 앱 설정 > 기본에서 **앱 ID**와 **앱 시크릿**을 확인한다.

#### 장기 액세스 토큰 발급

1. Instagram Graph API 탐색기 또는 앱 대시보드의 토큰 생성기에서 **단기 액세스 토큰**을 발급받는다.
2. 아래 API를 호출하여 **장기 액세스 토큰**으로 교환한다 (유효기간 60일, 이 스킬이 자동 갱신):
   ```
   GET https://graph.instagram.com/access_token
     ?grant_type=ig_exchange_token
     &client_secret=<앱_시크릿>
     &access_token=<단기_토큰>
   ```

#### .env 설정

```bash
cp .env.example .env
```

```
INSTAGRAM_APP_ID=<앱-ID>
INSTAGRAM_APP_SECRET=<앱-시크릿>
INSTAGRAM_ACCESS_TOKEN=<장기-액세스-토큰>
```

### 3. cloudflared 설치 (로컬 이미지 게시 시 필요)

```bash
# macOS
brew install cloudflared

# Ubuntu / Debian
curl -L -o cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-$(dpkg --print-architecture).deb
sudo dpkg -i cloudflared.deb
```

## 스킬 설치

### Claude Code

```bash
ln -s "$(pwd)" ~/.claude/skills/instagram-api
```

이후 `/instagram-api`로 호출하거나 Claude가 자동으로 사용한다.

### OpenAI Codex

```bash
ln -s "$(pwd)" ~/.agents/skills/instagram-api
```

## 스크립트

모든 스크립트는 stdout에 JSON을 출력하고, 로그는 stderr로 보낸다.
모든 스크립트는 `--env <경로>`로 커스텀 `.env` 파일을 지정할 수 있다.

| 스크립트 | 설명 |
|----------|------|
| `node scripts/get-profile.js` | 프로필 조회 |
| `node scripts/get-posts.js [--limit N]` | 게시물 목록 조회 |
| `node scripts/get-post.js <media-id>` | 게시물 상세 조회 |
| `node scripts/post-image.js --caption "..." <이미지>` | 이미지 게시 |
| `node scripts/get-comments.js <media-id>` | 댓글 조회 |
| `node scripts/post-comment.js <media-id> --text "..."` | 댓글 작성 |
| `node scripts/reply-comment.js <comment-id> --text "..."` | 답글 작성 |
| `node scripts/refresh-token.js` | 수동 토큰 갱신 |

### 이미지 게시 예시

```bash
# URL 단일 이미지
node scripts/post-image.js --caption "안녕" https://example.com/photo.jpg

# 로컬 단일 이미지
node scripts/post-image.js --caption "안녕" ./photo.png

# 로컬 캐러셀 (여러 장)
node scripts/post-image.js --caption "안녕" ./a.png ./b.jpg ./c.heic
```

## 요구사항

- Node.js v18+
- `cloudflared` — 로컬 이미지 게시 시에만 필요
- Instagram Graph API 자격 증명 (장기 액세스 토큰)
