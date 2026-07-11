import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/firebaseClient";
import type { HiddenObject } from "../../types/models";

export interface CreateLevelRequest {
  title: string;
  imagePath: string;
  thumbnailPath: string;
  imageUrl: string;
  objects: HiddenObject[];
  visibility: "public" | "private";
}

export interface CreateLevelResponse {
  levelId: string;
  code: string;
}

export async function callCreateLevel(payload: CreateLevelRequest): Promise<CreateLevelResponse> {
  const fn = httpsCallable<CreateLevelRequest, CreateLevelResponse>(functions, "createLevel");
  const result = await fn(payload);
  return result.data;
}

export async function callRegisterPlay(levelId: string): Promise<void> {
  const fn = httpsCallable<{ levelId: string }, { ok: boolean }>(functions, "registerPlay");
  await fn({ levelId });
}

export async function callRecordLevelComplete(levelId: string): Promise<void> {
  const fn = httpsCallable<{ levelId: string }, { ok: boolean }>(functions, "recordLevelComplete");
  await fn({ levelId });
}

export interface SuggestObjectsResponse {
  objects: HiddenObject[];
}

export async function callSuggestHiddenObjects(imageUrl: string): Promise<HiddenObject[]> {
  const fn = httpsCallable<{ imageUrl: string }, SuggestObjectsResponse>(
    functions,
    "suggestHiddenObjects"
  );
  const result = await fn({ imageUrl });
  return result.data.objects;
}
