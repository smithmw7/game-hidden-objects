import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase/firebaseClient";
import { normalizeGameCode } from "../share/gameCode";
import type { HiddenObject, Level } from "../../types/models";

const LEVELS_COLLECTION = "levels";

async function compressImage(file: File): Promise<Blob> {
  // Minimal MVP compression path; can be replaced with better codec logic later.
  return file.slice(0, file.size, file.type);
}

export async function uploadLevelImage(uid: string, levelId: string, file: File): Promise<string> {
  const compressedBlob = await compressImage(file);
  const storageRef = ref(storage, `levels/${uid}/${levelId}/main.jpg`);
  await uploadBytes(storageRef, compressedBlob, { contentType: "image/jpeg" });
  return getDownloadURL(storageRef);
}

export async function lookupLevelByCode(code: string): Promise<Level | null> {
  const normalizedCode = normalizeGameCode(code);
  const levelsRef = collection(db, LEVELS_COLLECTION);
  const codeQuery = query(levelsRef, where("code", "==", normalizedCode), limit(1));
  const snapshot = await getDocs(codeQuery);

  if (snapshot.empty) {
    return null;
  }

  const first = snapshot.docs[0];
  return { id: first.id, ...(first.data() as Omit<Level, "id">) };
}

export async function resolveObjectsFallback(): Promise<HiddenObject[]> {
  return [
    { label: "Book", x: 0.26, y: 0.41, width: 0.1, height: 0.08 },
    { label: "Plant", x: 0.67, y: 0.52, width: 0.09, height: 0.13 },
    { label: "Lamp", x: 0.78, y: 0.24, width: 0.07, height: 0.14 }
  ];
}
