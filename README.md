# Gave til mor

Fødselsdagsgave-side der åbnes via QR-kode på mobilen: hilsen → åbn gaven (animation) → gaven
(kaffekursus for to) → "vil du tage imod?" → vælg dato og tid → ønsket sendes til Simon.

- `index.html` – selve siden. Tekster og `SIMON_PHONE`/`SIMON_EMAIL` rettes i toppen af `<script>`.
- `api/book.js` – Vercel-funktion. Mailer ønsket via Resend hvis `RESEND_API_KEY` og `BOOKING_TO`
  er sat som env-vars i Vercel (valgfrit `BOOKING_FROM`). Uden dem logges ønsket, og siden viser
  en SMS/mail-knap i stedet.
- `kort.html` – printbart A5-kort med QR-koden (QR peger på det domæne kortet åbnes fra).

Lokal preview (uden API): `PORT=3032 npm run dev`. Deploy: Vercel-projektet `gave-mor`.
