"use client";

import { useState } from "react";

const CONTACT_EMAIL = "mandeeps@gurunanakinstitute.ca";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = `Message from ${name || "the Gurbani Aarth Milaan site"}`;
    const body = `${message}\n\n— ${name}${email ? ` (${email})` : ""}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <main className="page">
      <h1>Contact Us</h1>
      <p className="subtitle">Questions, corrections, or feedback — we'd like to hear it.</p>

      <p className="contact-email">
        Email us directly at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

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
          Message
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            required
          />
        </label>
        <button type="submit" className="search-button">
          Send Message
        </button>
        <p className="contact-note">
          This opens your email app with the message pre-filled, addressed to us.
        </p>
      </form>
    </main>
  );
}
