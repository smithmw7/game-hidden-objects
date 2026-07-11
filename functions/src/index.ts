import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { suggestHiddenObjectsFromImageUrl } from "./services/aiService";
import { applyCompletionRewards } from "./services/rewardService";
import { generateReadableCode } from "./utils/gameCode";

admin.initializeApp();
const db = admin.firestore();

interface HiddenObjectInput {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function validateObjects(objects: unknown): HiddenObjectInput[] {
  if (!Array.isArray(objects) || objects.length === 0) {
    throw new HttpsError("invalid-argument", "objects[] required");
  }

  const out: HiddenObjectInput[] = [];
  for (const item of objects) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const o = item as Record<string, unknown>;
    const label = typeof o.label === "string" ? o.label : "Item";
    const x = Number(o.x);
    const y = Number(o.y);
    const width = Number(o.width);
    const height = Number(o.height);
    if ([x, y, width, height].some((n) => Number.isNaN(n) || n < 0 || n > 1)) {
      throw new HttpsError("invalid-argument", "object bounds must be 0..1");
    }
    out.push({ label, x, y, width, height });
  }

  if (out.length === 0) {
    throw new HttpsError("invalid-argument", "objects[] invalid");
  }

  return out.slice(0, 24);
}

export const createLevel = onCall({ region: "us-central1" }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in required");
  }

  const uid = request.auth.uid;
  const data = request.data as {
    title?: string;
    imagePath?: string;
    thumbnailPath?: string;
    imageUrl?: string;
    objects?: unknown;
    visibility?: "public" | "private";
  };

  const title = typeof data.title === "string" ? data.title.trim().slice(0, 48) : "";
  const imagePath = typeof data.imagePath === "string" ? data.imagePath : "";
  const thumbnailPath = typeof data.thumbnailPath === "string" ? data.thumbnailPath : "";
  const imageUrl = typeof data.imageUrl === "string" ? data.imageUrl : "";

  if (!title || !imagePath || !thumbnailPath || !imageUrl) {
    throw new HttpsError("invalid-argument", "title, imagePath, thumbnailPath, imageUrl required");
  }

  if (!imagePath.startsWith(`levels/${uid}/`) || !thumbnailPath.startsWith(`levels/${uid}/`)) {
    throw new HttpsError("invalid-argument", "Invalid storage paths");
  }

  const visibility = data.visibility === "private" ? "private" : "public";
  const objects = validateObjects(data.objects);

  let code = "";
  for (let attempt = 0; attempt < 25; attempt += 1) {
    code = generateReadableCode();
    const dup = await db.collection("levels").where("code", "==", code).limit(1).get();
    if (dup.empty) {
      break;
    }
    if (attempt === 24) {
      throw new HttpsError("resource-exhausted", "Could not allocate a unique code");
    }
  }

  const docRef = await db.collection("levels").add({
    code,
    creatorId: uid,
    title,
    imagePath,
    thumbnailPath,
    imageUrl,
    objects,
    playCount: 0,
    visibility,
    createdAt: FieldValue.serverTimestamp()
  });

  return { levelId: docRef.id, code };
});

export const registerPlay = onCall({ region: "us-central1" }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in required");
  }

  const levelId = (request.data as { levelId?: string })?.levelId;
  if (!levelId || typeof levelId !== "string") {
    throw new HttpsError("invalid-argument", "levelId required");
  }

  await db.collection("levels").doc(levelId).update({
    playCount: FieldValue.increment(1)
  });

  return { ok: true };
});

export const recordLevelComplete = onCall({ region: "us-central1" }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in required");
  }

  const playerUid = request.auth.uid;
  const levelId = (request.data as { levelId?: string })?.levelId;
  if (!levelId || typeof levelId !== "string") {
    throw new HttpsError("invalid-argument", "levelId required");
  }

  await applyCompletionRewards(playerUid, levelId);
  return { ok: true };
});

export const suggestHiddenObjects = onCall({ region: "us-central1" }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in required");
  }

  const uid = request.auth.uid;
  const imageUrl = (request.data as { imageUrl?: string })?.imageUrl;
  if (!imageUrl || typeof imageUrl !== "string") {
    throw new HttpsError("invalid-argument", "imageUrl required");
  }

  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const tokens = (userSnap.get("tokens") as number | undefined) ?? 0;

  if (tokens < 1) {
    throw new HttpsError("failed-precondition", "Not enough tokens");
  }

  await userRef.set(
    {
      uid,
      tokens: FieldValue.increment(-1)
    },
    { merge: true }
  );

  const objects = await suggestHiddenObjectsFromImageUrl(imageUrl);
  return { objects };
});
