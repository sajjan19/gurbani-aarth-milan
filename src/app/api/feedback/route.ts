import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { ALLOWED_PHOTO_TYPES, MAX_PHOTOS, MAX_PHOTO_BYTES } from "@/lib/feedback";

const FEEDBACK_EMAIL = "mandeeps@gurunanakinstitute.ca";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type IncomingPhoto = { filename: string; type: string; dataBase64: string };

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email sending isn't configured on the server yet." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);

  const name = asText(body?.name);
  const email = asText(body?.email);
  const phone = asText(body?.phone);
  const message = asText(body?.message);
  // Gathered by the browser rather than asked for -- testers shouldn't have
  // to know their browser version, and self-reported answers are unreliable.
  const environment = asText(body?.environment);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and a description are required." },
      { status: 400 }
    );
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const rawPhotos: IncomingPhoto[] = Array.isArray(body?.photos) ? body.photos : [];
  if (rawPhotos.length > MAX_PHOTOS) {
    return NextResponse.json(
      { error: `Please attach at most ${MAX_PHOTOS} photos.` },
      { status: 400 }
    );
  }

  const attachments: { filename: string; content: string }[] = [];
  for (const photo of rawPhotos) {
    const filename = asText(photo?.filename) || "screenshot";
    const type = asText(photo?.type);
    const dataBase64 = typeof photo?.dataBase64 === "string" ? photo.dataBase64 : "";

    if (!ALLOWED_PHOTO_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `${filename} isn't an image we can accept (PNG, JPEG, WebP or GIF).` },
        { status: 400 }
      );
    }
    // base64 encodes 3 bytes as 4 characters, so this recovers the real size
    // without having to decode the whole payload first.
    const approxBytes = Math.floor((dataBase64.length * 3) / 4);
    if (!dataBase64 || approxBytes > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { error: `${filename} is too large -- please keep photos under 5MB.` },
        { status: 400 }
      );
    }
    attachments.push({ filename, content: dataBase64 });
  }

  const contact = [`${name} (${email}${phone ? `, ${phone}` : ""})`, environment]
    .filter(Boolean)
    .join("\n");

  const text = [message, "—", contact].filter(Boolean).join("\n\n");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Gurbani Aarth Milan <onboarding@resend.dev>",
    to: FEEDBACK_EMAIL,
    replyTo: email,
    // Prefixed so tester reports can be filtered apart from contact-form mail.
    subject: `[Feedback] ${name}`,
    text,
    ...(attachments.length > 0 ? { attachments } : {}),
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to send feedback. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
