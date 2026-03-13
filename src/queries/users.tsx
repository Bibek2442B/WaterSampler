import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
  arrayUnion, arrayRemove,
} from "firebase/firestore";
import { db } from "@/firebase.config";

export interface UsersPage {
  users: UserInterface[];
}

export type UserRole = "ADMIN" | "OPERATOR" | "VIEWER";

export interface UserInterface {
  id: string;
  name?: string;
  email?: string;
  role: UserRole;
  approvedByAdmin?: boolean;
}

export async function fetchUsers(): Promise<UsersPage> {
  const q = query(
    collection(db, "users"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  const users: UserInterface[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<UserInterface, "id">),
  }));

  return { users };
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole
) {
  const ref = doc(db, "users", userId);
  await updateDoc(ref, { role: newRole });
}

export async function addSamplerToUser(userId: string, samplerId: string) {
  const ref = doc(db,"users", userId);
  await updateDoc(ref, {samplers: arrayUnion(samplerId)});
}

export async function removeSamplerFromUser(userId: string, samplerId: string) {
  const ref = doc(db,"users", userId);
  await updateDoc(ref, {samplers: arrayRemove(samplerId)});
}