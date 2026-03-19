// background.js — JUST Save Image as PNG, JPG, WebP
// No data is sent anywhere. Everything happens locally in your browser.

const FORMATS = [
  { id: "save-as-png",  label: "Save Image as PNG",  mime: "image/png",  ext: "png"  },
  { id: "save-as-jpg",  label: "Save Image as JPG",  mime: "image/jpeg", ext: "jpg"  },
  { id: "save-as-webp", label: "Save Image as WebP", mime: "image/webp", ext: "webp" },
];

chrome.runtime.onInstalled.addListener(buildMenus);
chrome.runtime.onStartup.addListener(buildMenus);

function buildMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "save-image-as-parent",
      title: "Save Image As…",
      contexts: ["image"],
    });
    for (const fmt of FORMATS) {
      chrome.contextMenus.create({
        id: fmt.id,
        parentId: "save-image-as-parent",
        title: fmt.label,
        contexts: ["image"],
      });
    }
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const fmt = FORMATS.find(f => f.id === info.menuItemId);
  if (!fmt || !info.srcUrl) return;

  let baseName = info.srcUrl.split("/").pop().split("?")[0];
  baseName = baseName.replace(/\.[^.]+$/, "") || "image";
  const filename = `${baseName}.${fmt.ext}`;

  // Fetch and convert entirely in the SW, return a base64 data URL.
  // SW has no createObjectURL, but chrome.downloads accepts data: URLs directly.
  try {
    const dataUrl = await swFetchAndConvert(info.srcUrl, fmt);
    await chrome.downloads.download({ url: dataUrl, filename, saveAs: true });
    return;
  } catch (err) {
    console.warn("SW convert failed:", err.message);
  }

  // Last resort: download the original file renamed.
  console.warn("Conversion unavailable, downloading original.");
  await chrome.downloads.download({ url: info.srcUrl, filename, saveAs: true });
});

// ---------------------------------------------------------------------------
// Fetch image bytes in the SW, convert with OffscreenCanvas, return data URL.
// SW fetches with host_permissions bypass CORS. We avoid createObjectURL
// (not available in SW) by converting the output blob to base64 manually.
// ---------------------------------------------------------------------------
async function swFetchAndConvert(srcUrl, fmt) {
  const response = await fetch(srcUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const srcBlob = await response.blob();
  if (!srcBlob || srcBlob.size === 0) throw new Error("Empty blob");

  if (typeof OffscreenCanvas === "undefined") throw new Error("OffscreenCanvas unavailable");

  const bitmap = await createImageBitmap(srcBlob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");

  if (fmt.mime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, bitmap.width, bitmap.height);
  }

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const quality = fmt.mime === "image/jpeg" ? 0.92 : undefined;
  const outBlob = await canvas.convertToBlob({ type: fmt.mime, quality });

  // Convert blob → base64 data URL using FileReader (available in SW)
  return await blobToDataUrl(outBlob);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.readAsDataURL(blob);
  });
}
