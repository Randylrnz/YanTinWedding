import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "photobooth@yantin.wedding";

export interface SendPhotoEmailParams {
  to: string;
  guestName?: string | null;
  stripDataUrl: string;
  stripFilename: string;
}

export async function sendPhotoEmail(params: SendPhotoEmailParams): Promise<void> {
  const { to, guestName, stripDataUrl, stripFilename } = params;

  const greeting = guestName ? `Hello, ${guestName}!` : "Hello!";

  // Convert data URL to buffer for attachment
  const base64Data = stripDataUrl.split(",")[1];

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Wedding Photostrip</title>
</head>
<body style="margin:0;padding:0;background:#F5F1E8;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F1E8;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(128,0,32,0.10);">

          <!-- Header -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg,#800020 0%,#9d0027 100%);padding:40px 32px 32px;">
              <p style="margin:0;color:#F7E7CE;font-size:12px;letter-spacing:4px;text-transform:uppercase;font-family:Arial,sans-serif;">Wedding Photobooth</p>
              <h1 style="margin:12px 0 8px;color:#FFFFFF;font-size:42px;font-style:italic;letter-spacing:2px;">Yan ♥ Tin</h1>
              <p style="margin:0;color:#F7E7CE;font-size:13px;letter-spacing:2px;font-family:Arial,sans-serif;">#YanIsFinallyForTin</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;color:#6F4E37;font-size:16px;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 16px;color:#6F4E37;font-size:15px;line-height:1.7;">
                Thank you for celebrating our special day with us.
              </p>
              <p style="margin:0 0 24px;color:#6F4E37;font-size:15px;line-height:1.7;">
                Attached is your wedding photostrip from <strong>#YanIsFinallyForTin</strong>.
                We hope you enjoyed capturing these beautiful memories with us.
              </p>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
                <tr>
                  <td style="border-top:1px solid #E8C99A;"></td>
                  <td width="20" style="text-align:center;color:#E8C99A;padding:0 12px;">✦</td>
                  <td style="border-top:1px solid #E8C99A;"></td>
                </tr>
              </table>

              <p style="margin:0 0 4px;color:#800020;font-size:16px;font-style:italic;">With love,</p>
              <p style="margin:0;color:#800020;font-size:20px;font-style:italic;font-weight:bold;">Yan & Tin</p>
              <p style="margin:8px 0 0;color:#6F4E37;font-size:12px;letter-spacing:2px;font-family:Arial,sans-serif;">July 5, 2026</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background:#F5F1E8;padding:20px;border-top:1px solid #E8C99A;">
              <p style="margin:0;color:#6F4E37;font-size:11px;letter-spacing:1px;font-family:Arial,sans-serif;">#YanIsFinallyForTin · July 5, 2026</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  await getResend().emails.send({
    from: `Yan & Tin Wedding <${FROM}>`,
    to: [to],
    subject: "Your Wedding Photostrip from #YanIsFinallyForTin",
    html,
    attachments: [
      {
        filename: stripFilename,
        content: base64Data,
      },
    ],
  });
}
