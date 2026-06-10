// src/lib/uploadAvatar.js
// Cloudinary signed-upload flow for avatars:
//   1. ask our API to sign the upload (signAvatarUpload)
//   2. POST the file directly to Cloudinary with those signed params
//   3. save the resulting secure URL back to our API (saveAvatarUrl)
//
// The sign response shape (from the mobile app) is:
//   { cloudName, apiKey, timestamp, folder, publicId, transformation,
//     overwrite, signature }

import { signAvatarUpload, saveAvatarUrl } from "../api/user";

export async function uploadAvatar(file) {
  const sign = await signAvatarUpload();

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
  if (!res.ok) {
    throw new Error("Cloudinary upload failed");
  }
  const data = await res.json();
  const url = data.secure_url || data.url;
  if (!url) throw new Error("No URL returned from Cloudinary");

  // Persist the URL on the user record; returns the updated user.
  const user = await saveAvatarUrl(url);
  return user;
}
