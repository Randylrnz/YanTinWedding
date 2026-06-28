import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const ROOT_FOLDER_NAME = "Wedding Photobooth";
const WEDDING_FOLDER_NAME = "#YanIsFinallyForTin";

function getAuth() {
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured");
  }

  const credentials = JSON.parse(credJson);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
}

function getDriveClient() {
  const auth = getAuth();
  return google.drive({ version: "v3", auth });
}

async function findOrCreateFolder(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId?: string
): Promise<string> {
  const query = [
    `name = '${name}'`,
    `mimeType = 'application/vnd.google-apps.folder'`,
    `trashed = false`,
    parentId ? `'${parentId}' in parents` : null,
  ]
    .filter(Boolean)
    .join(" and ");

  const res = await drive.files.list({
    q: query,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  // Create it
  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : undefined,
    },
    fields: "id",
  });

  return folder.data.id!;
}

function getTodayFolderName(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface UploadResult {
  fileId: string;
  webUrl: string;
}

export async function uploadPhotostrip(
  dataUrl: string,
  filename: string
): Promise<UploadResult> {
  const drive = getDriveClient();

  // Get or use configured parent folder
  let parentId = process.env.GOOGLE_DRIVE_FOLDER_ID ?? undefined;

  if (!parentId) {
    // Auto-create folder hierarchy
    const rootId = await findOrCreateFolder(drive, ROOT_FOLDER_NAME);
    const weddingId = await findOrCreateFolder(drive, WEDDING_FOLDER_NAME, rootId);
    parentId = await findOrCreateFolder(drive, getTodayFolderName(), weddingId);
  } else {
    // Under the configured folder, create Wedding > Date subfolders
    const weddingId = await findOrCreateFolder(drive, WEDDING_FOLDER_NAME, parentId);
    parentId = await findOrCreateFolder(drive, getTodayFolderName(), weddingId);
  }

  // Convert base64 data URL to buffer
  const base64Data = dataUrl.split(",")[1];
  const buffer = Buffer.from(base64Data, "base64");

  // Upload
  const { Readable } = await import("stream");
  const stream = Readable.from(buffer);

  const uploaded = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType: "image/png",
      parents: [parentId],
    },
    media: {
      mimeType: "image/png",
      body: stream,
    },
    fields: "id, webViewLink",
  });

  return {
    fileId: uploaded.data.id!,
    webUrl: uploaded.data.webViewLink ?? `https://drive.google.com/file/d/${uploaded.data.id}/view`,
  };
}
