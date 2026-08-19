"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{
    name: string;
    email: string;
    phone: string;
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send message. Please try again.");
        setStatus("error");
        return;
      }
      setSent({ name, email, phone, message });
      setStatus("sent");
    } catch {
      setError("Failed to send message. Please try again.");
      setStatus("error");
    }
  }

  function handleSendAnother() {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setStatus("idle");
    setError(null);
    setSent(null);
  }

  return (
    <main className="page">
      <h1>Contact Us</h1>

      {status === "sent" && sent ? (
        <div className="contact-confirmation">
          <p className="contact-confirmation-title">Thanks, {sent.name} — your message is on its way.</p>
          <dl className="contact-confirmation-recap">
            <dt>Name</dt>
            <dd>{sent.name}</dd>
            <dt>Email</dt>
            <dd>{sent.email}</dd>
            {sent.phone && (
              <>
                <dt>Phone</dt>
                <dd>{sent.phone}</dd>
              </>
            )}
            <dt>Message</dt>
            <dd>{sent.message}</dd>
          </dl>
          <button type="button" className="contact-submit" onClick={handleSendAnother}>
            Send another message
          </button>
        </div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <label className="contact-field">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="contact-field">
            Your email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="contact-field">
            {/* Wrapped together so the flex column treats the label and the
                "(optional)" note as one row rather than stacking them. */}
            <span>
              Phone number <span className="contact-optional">(optional)</span>
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </label>
          <label className="contact-field">
            Message
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="contact-submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send Message"}
          </button>
        </form>
      )}
    </main>
  );
}
