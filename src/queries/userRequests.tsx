import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
} from "firebase/firestore";
import { db } from "@/firebase.config";

export interface PendingUser {
  id: string;
  name?: string;
  email?: string;
  createdAt?: Timestamp;
}

// Fetch pending users
export async function fetchPendingUsers(): Promise<{
  users: PendingUser[];
}> {
  const q = query(
    collection(db, "users"),
    where("approvedByAdmin", "==", false)
  );

  const snapshot = await getDocs(q);

  const users = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<PendingUser, "id">),
  }));

  return { users };
}

// Accept request
export async function acceptUserRequest(userId: string) {
  const ref = doc(db, "users", userId);
  await updateDoc(ref, { approvedByAdmin: true });
}

// Decline request
export async function declineUserRequest(userId: string) {
  const ref = doc(db, "users", userId);
  await deleteDoc(ref);
}