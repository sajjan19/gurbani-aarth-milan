import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { renderEmail } from "@/lib/emailTemplate";

const CONTACT_EMAIL = "mandeeps@gurunanakinstitute.ca";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email sending isn't configured on the server yet." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  // Optional -- senders can leave it blank.
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const { html, text } = renderEmail({
    heading: "New message from the contact form",
    message,
    fields: [
      { label: "From", value: name },
      { label: "Email", value: email },
      { label: "Phone", value: phone },
    ],
  });

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Gurbani Aarth Milan <onboarding@resend.dev>",
    to: CONTACT_EMAIL,
    // Replying in the mail client goes straight back to the sender rather
    // than to the shared address the site sends from.
    replyTo: email,
    subject: `New message from ${name} via Gurbani Aarth Milan`,
    html,
    text,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
