// Shared between the feedback form and the API route that emails it, so the
// two can't drift apart on what counts as a valid submission.

// Photos ride along as email attachments rather than being stored: the
// hosting has no persistent disk, so anything written there would vanish on
// the next deploy. These limits keep the message comfortably inside
// Resend's size ceiling, remembering base64 inflates bytes by about a third.
export const MAX_PHOTOS = 3;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
