import { NextRequest, NextResponse } from "next/server";
import { uploadPhotostrip } from "@/lib/googleDrive";
import { upsertSession, logDriveUpload } from "@/lib/database";

const MAX_RETRIES = 3;

export async function POST(req: NextRequest) {
  let body: { dataUrl?: string; filename?: string; sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { dataUrl, filename, sessionId } = body;
  if (!dataUrl || !filename || !sessionId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Ensure session exists in DB
  upsertSession({ id: sessionId, filename });

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { fileId, webUrl } = await uploadPhotostrip(dataUrl, filename);

      upsertSession({ id: sessionId, driveFileId: fileId, driveWebUrl: webUrl });
      logDriveUpload(sessionId, attempt, true);

      return NextResponse.json({ fileId, webUrl });
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      logDriveUpload(sessionId, attempt, false, lastError.message);

      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }

  console.error("Drive upload failed after retries:", lastError);
  return NextResponse.json(
    { error: "Google Drive upload failed", details: lastError?.message },
    { status: 500 }
  );
}
