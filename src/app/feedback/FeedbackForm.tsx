"use client";

import { useState } from "react";
import { MAX_PHOTOS, MAX_PHOTO_BYTES } from "@/lib/feedback";
import { useLanguage } from "@/components/LanguageProvider";

type Status = "idle" | "sending" | "sent" | "error";
type Photo = { filename: string; type: string; dataBase64: string; previewUrl: string };

// Strips the "data:image/png;base64," prefix that FileReader prepends, since
// the email API wants the raw base64 payload.
function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Recorded automatically instead of asked for -- a tester shouldn't have to
// know their browser version, and self-reported answers are often wrong.
function describeEnvironment(): string {
  if (typeof window === "undefined") return "";
  return [
    `Submitted: ${new Date().toLocaleString()}`,
    `Screen: ${window.innerWidth}x${window.innerHeight}`,
    `Browser: ${navigator.userAgent}`,
  ].join("\n");
}

export default function FeedbackForm() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files ?? []);
    // Reset immediately so picking the same file again still fires onChange.
    e.target.value = "";
    if (chosen.length === 0) return;

    if (photos.length + chosen.length > MAX_PHOTOS) {
      setError(t.feedback.tooMany(MAX_PHOTOS));
      return;
    }
    const tooBig = chosen.find((f) => f.size > MAX_PHOTO_BYTES);
    if (tooBig) {
      setError(t.feedback.tooBig(tooBig.name));
      return;
    }

    setError(null);
    const added = await Promise.all(
      chosen.map(async (file) => ({
        filename: file.name,
        type: file.type,
        dataBase64: await readAsBase64(file),
        previewUrl: URL.createObjectURL(file),
      }))
    );
    setPhotos((prev) => [...prev, ...added]);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          environment: describeEnvironment(),
          photos: photos.map(({ filename, type, dataBase64 }) => ({
            filename,
            type,
            dataBase64,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.feedback.failed);
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError(t.feedback.failed);
      setStatus("error");
    }
  }

  function handleSendAnother() {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setPhotos([]);
    setStatus("idle");
    setError(null);
  }

  if (status === "sent") {
    return (
      <main className="page">
        <h1>{t.feedback.title}</h1>
        <div className="contact-confirmation">
          <p className="contact-confirmation-title">{t.feedback.thanks}</p>
          <p>{t.feedback.thanksBody}</p>
          <button type="button" className="contact-submit" onClick={handleSendAnother}>
            {t.feedback.sendAnother}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>{t.feedback.title}</h1>
      <p className="subtitle">{t.feedback.subtitle}</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label className="contact-field">
          {t.feedback.name}
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label className="contact-field">
          {t.feedback.email}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label className="contact-field">
          <span>
            {t.feedback.phone} <span className="contact-optional">{t.feedback.optional}</span>
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </label>

        <label className="contact-field">
          {t.feedback.describe}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder={t.feedback.describePlaceholder}
            required
          />
        </label>

        <div className="contact-field">
          <span>
            {t.feedback.photos}{" "}
            <span className="contact-optional">{t.feedback.photosHint(MAX_PHOTOS)}</span>
          </span>
          <input type="file" accept="image/*" multiple onChange={handlePhotoChange} />
          {photos.length > 0 && (
            <ul className="photo-previews">
              {photos.map((photo, i) => (
                <li key={photo.previewUrl}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.previewUrl} alt="" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label={t.feedback.removePhoto(photo.filename)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="contact-submit" disabled={status === "sending"}>
          {status === "sending" ? t.feedback.sending : t.feedback.send}
        </button>
      </form>
    </main>
  );
}
