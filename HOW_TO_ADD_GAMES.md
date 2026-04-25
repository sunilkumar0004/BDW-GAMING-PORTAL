# 🎮 How to Add Games to BDW Gaming Portal

## Method 1: Edit `custom-games.json` (Easiest — No Code Required)

Edit the file at `server/custom-games.json` to add any game you want.

### Game Entry Format
```json
[
  {
    "id": "unique-game-id",
    "title": "Game Title",
    "image": "https://link-to-thumbnail.jpg",
    "url": "https://game-embed-url.html",
    "category": "Action",
    "description": "Short description of the game.",
    "isFeatured": true,
    "isNew": false
  }
]
```

### Fields
| Field | Required | Description |
|---|---|---|
| `id` | ✅ | Must be unique (e.g., `"custom-001"`) |
| `title` | ✅ | Display name of the game |
| `image` | ✅ | URL to a thumbnail (ideally 300x300) |
| `url` | ✅ | Embed URL of the game (iframe src) |
| `category` | ✅ | One of: Action, Puzzle, Racing & Driving, Sports, Shooter, Adventure, Casual, etc. |
| `description` | ❌ | Short description shown in the banner |
| `isFeatured` | ❌ | `true` to show in the hero carousel |
| `isNew` | ❌ | `true` to show the NEW badge |

### After Editing
After saving `custom-games.json`, refresh the cache by calling:
```
POST http://localhost:3001/api/games/admin/refresh
```

Or just restart the server — the cache clears on startup.

---

## Method 2: Change the API fetch amount

To fetch more games from the GameDistribution API, edit **`server/src/services/gameService.ts`**:

```ts
// Change this array to add more pages (each page = up to 200 games)
const API_PAGES = [1, 2, 3, 4, 5]; // 5 pages = up to 1000 games
```

---

## Available Categories (Auto-detected)
The category list is automatically built from all fetched games. Any category string you use in `custom-games.json` will automatically appear in the sidebar and pills.

---

## After Deploying

1. SSH into your server
2. Edit `server/custom-games.json`
3. Call `POST /api/games/admin/refresh` to reload without restarting

Or add the game to `custom-games.json` before deploying — it loads automatically on start.
