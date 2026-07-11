# Hidden Objects

Live development build: https://smithmw7.github.io/game-hidden-objects/

Social hidden-object MVP: **Vite + React + TypeScript + Phaser**, **Firebase** (Auth, Firestore, Storage, Functions, Hosting), **Capacitor iOS** for debug builds.

## Prerequisites

- Node.js 20+ recommended for Cloud Functions (Firebase also targets Node 20).
- Firebase CLI is available via this repo as `firebase-tools` (see scripts below).
- Xcode + CocoaPods for iOS (`npx cap open ios`).

## Setup

1. Install dependencies:

```bash
npm install
cd functions && npm install && cd ..
```

2. Connect the Firebase CLI and sync `.env.example` from your **Web app** SDK config (creates/updates non-secret `VITE_*` lines; leaves API keys blank):

```bash
npm run firebase:reauth
npm run firebase:link -- YOUR_PROJECT_ID
npm run firebase:sync-env-example
```

If `firebase:sync-env-example` fails, add a Web app under Firebase Console → Project settings → Your apps, then run it again.

3. Copy `.env.example` to `.env` and set **`VITE_FIREBASE_API_KEY`** (same Web app config in the Console; never commit `.env`).

4. Align `.firebaserc` with the same project (step 2 updates it when you run `firebase:link`).

5. Deploy rules once you have a project (or use emulators):

```bash
firebase deploy --only firestore:rules,storage
```

6. Configure **OpenAI** for AI suggestions (Functions only — never put API keys in `VITE_*`):

```bash
firebase functions:secrets:set OPENAI_API_KEY
```

If unset, `suggestHiddenObjects` falls back to deterministic placeholder targets.

## Development (web)

```bash
npm run dev
```

Open the printed LAN URL on your phone for portrait testing.

**GPT Image 2 (local only):** bottom nav **AI image** → `/test/image-gen`. The dev server proxies to OpenAI using the pinned snapshot **`gpt-image-2-2026-04-21`** by default (override with `OPENAI_IMAGE_MODEL` in `.env`). Endpoints: `images/generations` and `images/edits` (optional reference photo). Set `OPENAI_API_KEY` in `.env`. See [GPT Image 2 model](https://developers.openai.com/api/docs/models/gpt-image-2). GPT Image may require [API organization verification](https://help.openai.com/en/articles/10910291-api-organization-verification).

## Firebase Emulator Suite

```bash
firebase emulators:start
```

Set `VITE_USE_EMULATORS=true` in `.env` so the app talks to local Auth, Firestore, Storage, and Functions.

## Production build + Hosting

```bash
npm run build
firebase deploy --only hosting,functions
```

Hosting serves `dist/` with SPA rewrites from `firebase.json`.

## iOS debug + live reload

1. Build web assets: `npm run build`.
2. Sync to native: `npm run ios:sync`.
3. Open Xcode: `npm run ios:open`.

For **live reload** against your dev machine, run `npm run dev -- --host` and point Capacitor at your machine IP (same Wi‑Fi):

```bash
npx cap copy ios
```

Then set `server.url` temporarily in `capacitor.config.ts` (or use `CAP_SERVER_URL` via a small local patch) to `http://<YOUR_LAN_IP>:5173`, sync again, and run on device. Revert `server.url` for production-style builds.

## Architecture notes

- **Gameplay** reads level JSON from Firestore; **AI** runs only in Cloud Functions (`suggestHiddenObjects`, `aiService.ts`).
- **Publish** uses `createLevel` (callable) to allocate a **unique game code** with collision retries.
- **Play flow** uses `registerPlay` (play count) and `recordLevelComplete` (player + creator rewards).
- Phaser is imported as `import * as Phaser from "phaser"` for Phaser 4 ESM compatibility.

## Scripts

| Script        | Purpose                          |
|---------------|----------------------------------|
| `npm run dev` | Vite dev server                    |
| `npm run build` | Typecheck + production bundle    |
| `npm run ios:sync` | `cap sync ios`               |
| `npm run ios:open` | Open Xcode                   |
| `npm run firebase:reauth` | `npx firebase-tools login --reauth` |
| `npm run firebase:link -- <id>` | Set default Firebase project (updates `.firebaserc`) |
| `npm run firebase:sync-env-example` | Pull Web SDK config into `.env.example` |
