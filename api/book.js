// Vercel serverless function: modtager mors ønske.
// 1) Gemmer det i Vercel Blob, hvis en Blob-store er koblet på projektet (BLOB_READ_WRITE_TOKEN sættes automatisk).
// 2) Mailer det via Resend, hvis RESEND_API_KEY + BOOKING_TO er sat (valgfrit).
// Uden begge dele logges ønsket kun, og siden viser en SMS/mail-knap i stedet.
import { put } from "@vercel/blob";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  const body = typeof req.body === "string" ? safeJson(req.body) : (req.body || {});
  const { date, time, note = "", accepted = true } = body;
  if (!date) return res.status(400).json({ ok: false, error: "date mangler" });

  const wish = { date, time, note: String(note).slice(0, 500), accepted, at: new Date().toISOString() };
  console.log("[gave-mor booking]", JSON.stringify(wish));
  const pretty = new Date(date + "T12:00:00").toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // 1) Gem i Vercel Blob
  let saved = false;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const name = `oensker/${wish.at.replace(/[:.]/g, "-")}.json`;
      await put(name, JSON.stringify({ ...wish, pretty }, null, 2), { access: "public", contentType: "application/json", addRandomSuffix: false });
      saved = true;
    } catch (e) { console.error("[gave-mor] blob fejl", e); }
  }

  // 2) Mail via Resend (valgfrit)
  let mailed = false;
  const key = process.env.RESEND_API_KEY, to = process.env.BOOKING_TO;
  if (key && to) {
    const text = ["Mor har sagt ja tak til kaffekurset!", "", `Dato: ${pretty}`, `Tid:  ${time || "ikke valgt"}`, note ? `Note: ${note}` : null, "", `Modtaget ${wish.at}`].filter(x => x !== null).join("\n");
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.BOOKING_FROM || "Gave <onboarding@resend.dev>", to: [to], subject: `Mor vil gerne på kaffekursus: ${pretty} ${time || ""}`.trim(), text }),
      });
      if (!r.ok) console.error("[gave-mor] resend fejl", r.status, await r.text());
      mailed = r.ok;
    } catch (e) { console.error("[gave-mor] resend exception", e); }
  }

  return res.status(200).json({ ok: true, saved, mailed });
}

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }
