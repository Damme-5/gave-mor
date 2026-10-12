# Gave til mor

Fødselsdagsgave-side der åbnes via QR-kode på mobilen: hilsen → åbn gaven (animation) → gaven
(kaffekursus for to) → "vil du tage imod?" → vælg dato og tid → ønsket sendes til Simon.

- `index.html` – selve siden. Ønsket sendes som mail via Web3Forms (`WEB3FORMS_KEY` i toppen af `<script>`); `SIMON_PHONE`/`SIMON_EMAIL` er nødløsningen hvis det fejler.
- `api/book.js` – Vercel-funktion. Gemmer ønsket i Vercel Blob (kobl en Blob-store på projektet) og/eller mailer via Resend hvis `RESEND_API_KEY` og `BOOKING_TO`
  er sat som env-vars i Vercel (valgfrit `BOOKING_FROM`). Uden dem logges ønsket, og siden viser
  en SMS/mail-knap i stedet.
- `kort.html` – printbart A5-kort med QR-koden (QR peger på det domæne kortet åbnes fra).

Lokal preview (uden API): `PORT=3032 npm run dev`. Deploy: Vercel-projektet `gave-mor`.
