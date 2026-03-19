# JUST Save Image as PNG, JPG, WebP

Right-click any image. Save it as PNG, JPG, or WebP. That's it.

**Same thing as that other extension — but open source, no malware, no nonsense.**

---

## Why this exists

A popular "save image as" extension was removed from the Chrome Web Store after being found to contain malware. People loved what it did; nobody loved the hidden payload. This is the clean replacement — small enough to read in five minutes, with nothing hiding in it.

## How it works

When you choose a format, the extension:

1. Draws the image onto an HTML `<canvas>` element — locally, in your browser
2. Calls `.toDataURL()` to convert it to the chosen format
3. Passes the result to Chrome's native download manager

That's it. The full logic is in `background.js` (~100 lines). There are no external dependencies, no bundlers, no obfuscated code.

## Permissions used

| Permission | Why |
|---|---|
| `contextMenus` | To add the right-click menu items |
| `downloads` | To trigger the Save dialog |
| `activeTab` | To read which tab you're on |
| `scripting` | To run the canvas conversion in the page context |

No `<all_urls>` host permissions. No access to your browsing history, cookies, or any page content beyond the specific image you click.

## Known limitation

Images on sites with strict **CORS headers** may block canvas access — this is a browser security constraint that can't be worked around without a backend server (which we deliberately don't have). In practice this is rare. When it happens, the conversion will silently fail; the original extension had the same limitation.

## Installation (from source)

1. Clone or download this repository
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select this folder

## Contributing

PRs welcome. Please keep it simple — the whole point is that anyone can audit this in five minutes.

## License

MIT
