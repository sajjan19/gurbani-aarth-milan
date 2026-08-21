"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const { t } = useLanguage();
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
        setError(data.error ?? t.contact.failed);
        setStatus("error");
        return;
      }
      setSent({ name, email, phone, message });
      setStatus("sent");
    } catch {
      setError(t.contact.failed);
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
      <h1>{t.contact.title}</h1>

      {status === "sent" && sent ? (
        <div className="contact-confirmation">
          <p className="contact-confirmation-title">{t.contact.thanks(sent.name)}</p>
          <dl className="contact-confirmation-recap">
            <dt>{t.contact.recapName}</dt>
            <dd>{sent.name}</dd>
            <dt>{t.contact.recapEmail}</dt>
            <dd>{sent.email}</dd>
            {sent.phone && (
              <>
                <dt>{t.contact.recapPhone}</dt>
                <dd>{sent.phone}</dd>
              </>
            )}
            <dt>{t.contact.recapMessage}</dt>
            <dd>{sent.message}</dd>
          </dl>
          <button type="button" className="contact-submit" onClick={handleSendAnother}>
            {t.contact.sendAnother}
          </button>
        </div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <label className="contact-field">
            {t.contact.name}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="contact-field">
            {t.contact.email}
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
              {t.contact.phone} <span className="contact-optional">{t.contact.optional}</span>
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </label>
          <label className="contact-field">
            {t.contact.message}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="contact-submit" disabled={status === "sending"}>
            {status === "sending" ? t.contact.sending : t.contact.send}
          </button>
        </form>
      )}
    </main>
  );
}
