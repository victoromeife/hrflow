// lib/storage.ts
// File storage abstraction.
// For this assessment we store files on disk under ./public/uploads and expose
// them through a stable URL. The database only keeps metadata + a storageKey.
// In production this would be S3 / GCS / Azure Blob.

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export function validateFile(mimeType: string, size: number) {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error("Unsupported file type");
  }
  if (size > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum size is 25 MB");
  }
}

export function getUploadDir() {
  return UPLOAD_DIR;
}

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

// Returns a unique storage key (relative path from public/)
export function generateStorageKey(originalName: string): string {
  const ext = path.extname(originalName) || "";
  const unique = crypto.randomBytes(12).toString("hex");
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `uploads/${date}-${unique}${ext.toLowerCase()}`;
}

// Persist an uploaded Buffer to disk under the storage key.
export async function saveFile(buffer: Buffer, storageKey: string) {
  await ensureUploadDir();
  const fullPath = path.join(process.cwd(), "public", storageKey);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buffer);
}

// Delete a stored file by its storage key. Safe if the file does not exist.
export async function deleteFile(storageKey: string) {
  try {
    const fullPath = path.join(process.cwd(), "public", storageKey);
    await fs.unlink(fullPath);
  } catch {
    // ignore missing files
  }
}

// Resolve a public URL for a storage key (used by the UI to download/preview).
export function getFileUrl(storageKey: string): string {
  return `/api/files/${encodeURIComponent(storageKey)}`;
}

// True when the storage key stays inside the uploads directory (prevents path
// traversal attacks when deleting files).
export function isSafeStorageKey(storageKey: string): boolean {
  const normalized = path.normalize(storageKey);
  return normalized.startsWith("uploads/") && !normalized.startsWith("..");
}