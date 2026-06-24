# مستر سافي · Lulu Let's Connect 2026

Interactive tablet kiosk for the **Mr Savvy** robot host at the Lulu Let's Connect 2026 event.
Runs on the tablet mounted on the robot's chest — the tablet is the face + voice (no dependency on the robot's own audio).

## What it does
- An animated **Mr Savvy** avatar (the robot's face, alive: float + 3D tilt + reactive glow).
- Answers the **6 approved Lulu Let's Connect questions** by playing pre-rendered **Ali Ahmed** (Najdi) voice clips — instant, grounded, no live generation.
- **Two inputs:** big touch buttons (bulletproof, works offline) + voice ask (`ar-SA`, where the browser supports it).
- Bilingual approved clips bundled (AR + EN).

## Stack
Vite + React + TS + Tailwind v4. Audio = pre-rendered WAV clips in `public/clips/`.

## Dev
```bash
npm install
npm run dev      # local
npm run build    # production -> dist/
```

## Deploy
Auto-deploys to **GitHub Pages** on push to `main` (`.github/workflows/deploy.yml`).
The Pages URL is HTTPS — required for the tablet microphone.
