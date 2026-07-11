#!/usr/bin/env node
/**
 * Pulls Firebase Web SDK config via CLI and updates .env.example.
 * Leaves VITE_FIREBASE_API_KEY and OPENAI_API_KEY empty (add those in .env locally).
 *
 * Prerequisites: npm run firebase:reauth, then set default project, e.g.
 *   npx firebase-tools use <your-project-id>
 * Register a Web app in Firebase Console if `apps:sdkconfig` fails.
 */

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

function grab(key, text) {
  const double = text.match(new RegExp(`${key}:\\s*"([^"]*)"`));
  if (double) {
    return double[1];
  }
  const single = text.match(new RegExp(`${key}:\\s*'([^']*)'`));
  return single ? single[1] : "";
}

/** Firebase CLI may print JSON (v14+) or a JS snippet (legacy). */
function parseSdkStdout(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    try {
      const j = JSON.parse(trimmed);
      return {
        apiKey: typeof j.apiKey === "string" ? j.apiKey : "",
        authDomain: typeof j.authDomain === "string" ? j.authDomain : "",
        projectId: typeof j.projectId === "string" ? j.projectId : "",
        storageBucket: typeof j.storageBucket === "string" ? j.storageBucket : "",
        messagingSenderId:
          j.messagingSenderId != null ? String(j.messagingSenderId) : String(j.projectNumber ?? ""),
        appId: typeof j.appId === "string" ? j.appId : ""
      };
    } catch {
      // fall through to legacy parse
    }
  }

  return {
    apiKey: grab("apiKey", text),
    authDomain: grab("authDomain", text),
    projectId: grab("projectId", text),
    storageBucket: grab("storageBucket", text),
    messagingSenderId: grab("messagingSenderId", text),
    appId: grab("appId", text)
  };
}

let stdout;
try {
  stdout = execSync("npx firebase-tools apps:sdkconfig WEB", {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"]
  });
} catch (err) {
  console.error(
    "Could not fetch Web SDK config. Try:\n" +
      "  1. npm run firebase:reauth\n" +
      "  2. npm run firebase:link -- <your-project-id>\n" +
      "  3. Add a Web app in Firebase Console → Project settings → Your apps\n"
  );
  const e = err;
  if (e && typeof e === "object") {
    if ("stderr" in e && e.stderr) {
      console.error(String(e.stderr));
    }
    if ("stdout" in e && e.stdout) {
      console.error(String(e.stdout));
    }
  }
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

const parsed = parseSdkStdout(stdout);
const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } = parsed;

if (!projectId || !appId) {
  console.error(
    "Parsed SDK config is incomplete. Re-run: npx firebase-tools apps:sdkconfig WEB",
    "(output format may have changed)"
  );
  process.exit(1);
}

const envExamplePath = join(root, ".env.example");

const header =
  "# Firebase Web (non-secret fields synced via: npm run firebase:sync-env-example)\n" +
  "# Add VITE_FIREBASE_API_KEY in .env locally (not committed).\n";

const body =
  `VITE_FIREBASE_API_KEY=\n` +
  `VITE_FIREBASE_AUTH_DOMAIN=${authDomain}\n` +
  `VITE_FIREBASE_PROJECT_ID=${projectId}\n` +
  `VITE_FIREBASE_STORAGE_BUCKET=${storageBucket}\n` +
  `VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}\n` +
  `VITE_FIREBASE_APP_ID=${appId}\n` +
  `\n` +
  `# Set to "true" when running Firebase Emulator Suite locally\n` +
  `VITE_USE_EMULATORS=false\n` +
  `\n` +
  `# Cloud Functions only — use: firebase functions:secrets:set OPENAI_API_KEY\n` +
  `OPENAI_API_KEY=\n`;

writeFileSync(envExamplePath, `${header}\n${body}`, "utf8");

console.log("Updated .env.example from Firebase Web SDK config.");
console.log(`  projectId: ${projectId}`);
console.log(`  appId:     ${appId}`);
if (apiKey) {
  console.log("  (apiKey present in Firebase; left blank in .env.example — copy from Console into .env if needed)");
}
