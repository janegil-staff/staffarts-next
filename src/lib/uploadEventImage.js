// src/lib/uploadEventImage.js
// Cloudinary signed-upload flow for an event cover image. Same shape as the
// artwork/avatar uploads: sign via our API, POST the file to Cloudinary,
// return the secure URL. The URL is included in the createEvent payload.

import { signEventUpload } from "../api/event";

export async function uploadEventImage(file) {
  const sign = await signEventUpload();

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("signature", sign.signature);
  if (sign.folder) form.append("folder", sign.folder);
  if (sign.publicId) form.append("public_id", sign.publicId);
  if (sign.transformation) form.append("transformation", sign.transformation);
  if (sign.overwrite != null) form.append("overwrite", String(sign.overwrite));

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
    { method: "POST", body: form },
  );
  if (!res.ok) throw new Error("Cloudinary upload failed");

  const data = await res.json();
  const url = data.secure_url || data.url;
  if (!url) throw new Error("No URL returned from Cloudinary");
  return url;
}
