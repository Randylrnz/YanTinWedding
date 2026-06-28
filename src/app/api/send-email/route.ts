import { NextRequest, NextResponse } from "next/server";
import { sendPhotoEmail } from "@/lib/emailService";
import { upsertSession } from "@/lib/database";

const FIXED_RECIPIENT = "phyrohendrixtech@gmail.com";

export async function POST(req: NextRequest) {
  let body: {
    stripDataUrl?: string;
    stripFilename?: string;
    sessionId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { stripDataUrl, stripFilename, sessionId } = body;

  if (!stripDataUrl || !stripFilename || !sessionId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await sendPhotoEmail({
      to: FIXED_RECIPIENT,
      guestName: null,
      stripDataUrl,
      stripFilename,
    });

    upsertSession({
      id: sessionId,
      email: FIXED_RECIPIENT,
      guestName: null,
      emailSent: true,
      completedAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Email send failed:", message);
    return NextResponse.json(
      { error: "Failed to send email", details: message },
      { status: 500 }
    );
  }
}
