# JUST Save Image as PNG, JPG, WebP

Right-click any image. Save it as PNG, JPG, or WebP. That's it.

**Same thing as that other extension — but open source, no malware, no nonsense.**

---

## Why this exists

A popular "save image as" extension was removed from the Chrome Web Store after being found to contain malware. People loved what it did; nobody loved the hidden payload. This is the clean replacement — small enough to read in five minutes, with nothing hiding in it.

## How it works

When you choose a format, the extension fetches the image directly in its service worker and converts it using `OffscreenCanvas` — entirely locally, in your browser. The result is passed straight to Chrome's native download manager. No page canvas, no external servers, no nonsense.

The full logic is in `background.js` (~100 lines). No external dependencies. No bundlers. No obfuscated code. Read it yourself.

## Permissions used

| Permission | Why |
|---|---|
| `contextMenus` | To add the right-click menu items |
| `downloads` | To trigger the Save dialog |
| `activeTab` | To read which tab you're on |
| `scripting` | To run conversions in the page context |
| `tabs` | To identify the current tab's origin |
| `host_permissions` | To fetch images across all domains (this is what allows saving from Google, Gemini, Twitter, etc.) |

## Known limitation

Sites that block all external fetches at the network level (such as Instagram) cannot be saved. This is a deliberate platform restriction on their end, not a solvable technical problem — the original extension couldn't manage it either.

## Installation from source

1. Clone or download this repository
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select this folder

## Contributing

PRs welcome. Keep it simple — the whole point is that anyone can audit this in five minutes.

## License

MIT
