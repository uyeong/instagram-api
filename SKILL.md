---
name: instagram-api
description: Manage an Instagram account. View profile, list posts, publish images/carousels, publish videos/Reels, and read/write comments. Use when the user requests any Instagram-related task.
allowed-tools: Bash(node scripts/*)
compatibility: Requires node (v22+), npm, and cloudflared (for local file uploads). Requires env vars INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, INSTAGRAM_ACCESS_TOKEN in a .env file. Requires internet access to graph.instagram.com.
metadata:
  version: "1.0"
---

# Instagram API Skill

A skill for managing an Instagram account via the Instagram Graph API. Supports profile viewing, post management, image publishing, video/Reels publishing, and comment operations.

## Prerequisites

- A `.env` file with credentials must be configured.
  - Required: `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_ACCESS_TOKEN`
  - Recommended (for comment/reply via Facebook Graph): `FACEBOOK_USER_ACCESS_TOKEN`
  - Optional override for FB token refresh exchange: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`
- `cloudflared` must be installed for local image/video posting.
- If the user specifies a `.env` file path, append `--env <path>` to every command.
  - Example: `node scripts/get-profile.js --env /home/user/.instagram-env`
- All scripts must be run with this project root as the working directory.

## Permission Baseline (Master Confirmed)

Use this exact baseline when diagnosing auth/permission issues.

### Instagram permissions (3)
- `instagram_business_basic`
- `instagram_manage_comments`
- `instagram_business_manage_messages`

### Facebook Page / Business permissions (8)
- `pages_show_list`
- `business_management`
- `instagram_basic`
- `instagram_manage_comments`
- `instagram_manage_insights`
- `instagram_content_publish`
- `pages_read_engagement`
- `instagram_manage_contents`

## Token Strategy (IMPORTANT)

Use **two-token strategy** for reliability:

1. **Instagram token (`INSTAGRAM_ACCESS_TOKEN`)**
   - Use for profile/media lookup and publishing flows (`graph.instagram.com`).
   - Supports IG long-lived refresh flow.

2. **Facebook user token (`FACEBOOK_USER_ACCESS_TOKEN`)**
   - Use for comment/reply flows (`graph.facebook.com`) when required.
   - Typically required for stable `comments`/`replies` behavior on IG business-linked assets.

### Refresh behavior

- IG token refresh is handled by existing refresh flow.
- FB user token uses a different lifecycle than IG; treat it independently.
- Keep both tokens in `.env` and update/persist each token according to its own refresh path.

## Available Commands

All commands automatically refresh the token before execution. No manual refresh needed.

### Refresh Token

```bash
# Instagram token refresh
node scripts/refresh-token.js

# Facebook user token refresh (for comments/replies flow)
node scripts/refresh-facebook-token.js
```

Manually refreshes token(s) and returns expiration info.

### View Profile

```bash
node scripts/get-profile.js
```

Returns profile info (name, username, account type, media count).

### List Posts

```bash
node scripts/get-posts.js [--limit 10]
```

Returns the user's post list. Use `--limit` to set the count (default: 10).

### View Post Detail

```bash
node scripts/get-post.js <media-id>
```

Returns post detail including like count and comment count.

### Publish Image

```bash
# Single image (URL)
node scripts/post-image.js --caption "Caption" https://example.com/photo.jpg

# Single image (local file)
node scripts/post-image.js --caption "Caption" ./photos/image.png

# Carousel — multiple images (URL)
node scripts/post-image.js --caption "Caption" https://example.com/a.jpg https://example.com/b.jpg

# Carousel — multiple images (local files)
node scripts/post-image.js --caption "Caption" ./img1.png ./img2.png ./img3.jpg
```

- 1 image → single post, 2+ images → automatically posted as carousel (max 10).
- Both URLs (`http://`, `https://`) and local file paths are supported, but mixing is not allowed.
- Supported local file formats: jpg, jpeg, png, gif, webp, heic/heif (HEIC is automatically converted to JPEG).

### Publish Video (Reels)

```bash
# Single video (URL)
node scripts/post-video.js --caption "Caption" https://example.com/video.mp4

# Single video (local file)
node scripts/post-video.js --caption "Caption" ./videos/clip.mp4

# With cover image and options
node scripts/post-video.js --caption "Caption" --cover https://example.com/cover.jpg --thumb-offset 5000 --share-to-feed true https://example.com/video.mp4

# Video carousel — multiple videos (URL)
node scripts/post-video.js --caption "Caption" https://example.com/a.mp4 https://example.com/b.mp4

# Video carousel — multiple videos (local files)
node scripts/post-video.js --caption "Caption" ./clip1.mp4 ./clip2.mov
```

- 1 video → Reels post, 2+ videos → automatically posted as carousel (max 10).
- Both URLs and local file paths are supported, but mixing is not allowed.
- Supported formats: mp4, mov (max 100MB per file).
- `--cover`, `--thumb-offset`, `--share-to-feed` options are only available for single video posts (not carousels).
- Video processing takes longer than images; the script waits up to 10 minutes.

### View Comments

```bash
node scripts/get-comments.js <media-id>
```

Returns comments and replies for a specific post.

### Post Comment

```bash
node scripts/post-comment.js <media-id> --text "Comment text"
```

### Reply to Comment

```bash
node scripts/reply-comment.js <comment-id> --text "Reply text"
```

## Workflow Guidelines

- When publishing images or videos, always confirm the caption with the user before executing.
- After publishing, use `get-post.js` to retrieve the permalink and report both the result ID and permalink to the user.
- Video processing takes longer than images. Inform the user that it may take a few minutes.
- When writing comments/replies, confirm the content with the user before executing.
- Prefer IG token path for media/profile/publish operations; use FB user token path for comment/reply operations.
- All command outputs are in JSON format.

## Error Handling

If the output contains an `error` field, an error has occurred. Explain the cause to the user and suggest a resolution.

```json
{ "error": "error message" }
```
