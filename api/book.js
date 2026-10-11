// Vercel serverless function: modtager mors ønske og mailer det til Simon via Resend.
// Uden RESEND_API_KEY + BOOKING_TO logges ønsket kun (ses under Vercel → Logs), og siden
// falder tilbage til en SMS/mail-knap.
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  const body = typeof req.body === "string" ? safeJson(req.body) : (req.body || {});
  const { date, time, note = "", accepted = true } = body;
  if (!date) return res.status(400).json({ ok: false, error: "date mangler" });

  const wish = { date, time, note: String(note).slice(0, 500), accepted, at: new Date().toISOString() };
  console.log("[gave-mor booking]", JSON.stringify(wish));

  const key = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_TO;
  const from = process.env.BOOKING_FROM || "Gave <onboarding@resend.dev>";
  if (!key || !to) return res.status(200).json({ ok: true, mailed: false });

  const pretty = new Date(date + "T12:00:00").toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const text = [
    "Mor har sagt ja tak til kaffekurset!",
    "",
    `Dato: ${pretty}`,
    `Tid:  ${time || "ikke valgt"}`,
    note ? `Note: ${note}` : null,
    "",
    `Modtaget ${wish.at}`,
  ].filter(x => x !== null).join("\n");

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: `Mor vil gerne på kaffekursus: ${pretty} ${time || ""}`.trim(), text }),
    });
    if (!r.ok) console.error("[gave-mor] resend fejl", r.status, await r.text());
    return res.status(200).json({ ok: true, mailed: r.ok });
  } catch (e) {
    console.error("[gave-mor] resend exception", e);
    return res.status(200).json({ ok: true, mailed: false });
  }
}

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }
