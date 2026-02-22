import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase.config";

export async function updateUserProfile(
  userId: string,
  data: { name: string }
) {
  const ref = doc(db, "users", userId);
  await updateDoc(ref, data);
}