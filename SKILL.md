---
name: instagram-api
description: Manage an Instagram account. View profile, list posts, publish images/carousels, and read/write comments. Use when the user requests any Instagram-related task.
allowed-tools: Bash(node scripts/*)
---

# Instagram API Skill

A skill for managing an Instagram account via the Instagram Graph API. Supports profile viewing, post management, image publishing, and comment operations.

## Prerequisites

- A `.env` file with Instagram credentials must be configured (`INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_ACCESS_TOKEN`).
- `cloudflared` must be installed for local image posting.
- If the user specifies a `.env` file path, append `--env <path>` to every command.
  - Example: `node scripts/get-profile.js --env /home/user/.instagram-env`
- All scripts must be run with this project root as the working directory.

## Available Commands

All commands automatically refresh the token before execution. No manual refresh needed.

### Refresh Token

```bash
node scripts/refresh-token.js
```

Manually refreshes the token and returns expiration info.

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

- When publishing images, always confirm the caption with the user before executing.
- After publishing, use `get-post.js` to retrieve the permalink and report both the result ID and permalink to the user.
- When writing comments/replies, confirm the content with the user before executing.
- All command outputs are in JSON format.

## Error Handling

If the output contains an `error` field, an error has occurred. Explain the cause to the user and suggest a resolution.

```json
{ "error": "error message" }
```
