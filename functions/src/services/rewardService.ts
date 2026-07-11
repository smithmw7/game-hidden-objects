import * as admin from "firebase-admin";

const PLAYER_WIN_COINS = 10;
const CREATOR_REWARD_COINS = 5;

export async function applyCompletionRewards(playerUid: string, levelId: string): Promise<void> {
  const db = admin.firestore();
  const levelRef = db.collection("levels").doc(levelId);
  const levelSnap = await levelRef.get();

  if (!levelSnap.exists) {
    throw new Error("Level not found");
  }

  const creatorId = levelSnap.get("creatorId") as string | undefined;
  if (!creatorId) {
    throw new Error("Invalid level");
  }

  const batch = db.batch();
  const playerRef = db.collection("users").doc(playerUid);

  batch.set(
    playerRef,
    {
      uid: playerUid,
      coins: admin.firestore.FieldValue.increment(PLAYER_WIN_COINS)
    },
    { merge: true }
  );

  if (creatorId !== playerUid) {
    const creatorRef = db.collection("users").doc(creatorId);
    batch.set(
      creatorRef,
      {
        uid: creatorId,
        coins: admin.firestore.FieldValue.increment(CREATOR_REWARD_COINS)
      },
      { merge: true }
    );
  }

  await batch.commit();
}
