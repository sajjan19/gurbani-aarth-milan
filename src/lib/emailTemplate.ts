// Builds the notification emails the contact and feedback forms send.
//
// Mail clients are a far more hostile rendering target than a browser:
// stylesheets are stripped, many clients ignore anything outside the body,
// and layout has to survive Outlook. So everything here is inline styles on
// plain elements, with no classes, no external CSS and no web fonts.
//
// Every value that came from a form is escaped. This is untrusted input
// being put into HTML, and a stray angle bracket in someone's message
// should show up as an angle bracket rather than breaking the layout.

const BLUE = "#1c4e91";
const ORANGE = "#f2841e";
const BORDER = "#d8dee6";
const MUTED = "#6b7482";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type EmailField = { label: string; value: string };

type EmailParts = {
  /** Sits above the message, naming which form this came from. */
  heading: string;
  /** What the sender actually wrote. */
  message: string;
  /** Who sent it -- rendered as a labelled list under the message. */
  fields: EmailField[];
  /** Anything gathered automatically, kept visually apart from the above. */
  technical?: EmailField[];
  /** Noted at the end so attachments aren't missed. */
  attachmentNote?: string;
};

function fieldRows(fields: EmailField[], labelColor: string): string {
  return fields
    .filter((f) => f.value)
    .map(
      (f) => `
        <tr>
          <td style="padding:4px 16px 4px 0;vertical-align:top;white-space:nowrap;
                     font-size:12px;font-weight:bold;color:${labelColor};
                     text-transform:uppercase;letter-spacing:0.04em;">
            ${escapeHtml(f.label)}
          </td>
          <td style="padding:4px 0;vertical-align:top;font-size:14px;color:#171717;">
            ${escapeHtml(f.value)}
          </td>
        </tr>`
    )
    .join("");
}

export function renderEmail(parts: EmailParts): { html: string; text: string } {
  const { heading, message, fields, technical = [], attachmentNote } = parts;

  // Newlines are the sender's paragraphing; without this the whole message
  // collapses into one run-on block.
  const messageHtml = escapeHtml(message).replace(/\r?\n/g, "<br />");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f6fa;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
           style="max-width:600px;margin:0 auto;background:#ffffff;
                  border:1px solid ${BORDER};border-radius:10px;
                  border-collapse:separate;overflow:hidden;
                  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
      <tr>
        <td style="padding:20px 24px;background:${BLUE};">
          <div style="font-size:16px;font-weight:bold;color:#ffffff;">
            ${escapeHtml(heading)}
          </div>
          <div style="font-size:12px;color:#c7d4ec;margin-top:2px;">
            Gurbani Aarth Milan
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding:24px;">
          <div style="font-size:15px;line-height:1.6;color:#171717;
                      border-left:3px solid ${ORANGE};padding-left:14px;">
            ${messageHtml}
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding:0 24px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                 style="width:100%;border-top:1px solid ${BORDER};padding-top:14px;">
            ${fieldRows(fields, BLUE)}
          </table>
        </td>
      </tr>
      ${
        technical.filter((f) => f.value).length > 0
          ? `<tr>
        <td style="padding:0 24px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                 style="width:100%;border-top:1px solid ${BORDER};padding-top:14px;">
            ${fieldRows(technical, MUTED)}
          </table>
        </td>
      </tr>`
          : ""
      }
      ${
        attachmentNote
          ? `<tr>
        <td style="padding:0 24px 22px;font-size:13px;color:${MUTED};">
          ${escapeHtml(attachmentNote)}
        </td>
      </tr>`
          : ""
      }
    </table>
  </body>
</html>`;

  // Sent alongside the HTML, for clients set to plain text and for anyone
  // reading it on a watch or through a screen reader that prefers it.
  const textFields = [...fields, ...technical]
    .filter((f) => f.value)
    .map((f) => `${f.label}: ${f.value}`)
    .join("\n");
  const text = [heading, "", message, "", "—", textFields, attachmentNote ?? ""]
    .filter((line, i) => line !== "" || i < 6)
    .join("\n")
    .trim();

  return { html, text };
}
