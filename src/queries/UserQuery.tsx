import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from "@/firebase.config";
import {UserInterface} from "@/src/interfaces";

export async function fetchUsers() {
  const q = query(
    collection(db, "users"),
    where("role", "!=", "ADMIN")
  );
  const snapshot = await getDocs(q);
  const users: UserInterface[] = snapshot.docs.map((doc)=>({
    id: doc.id,
    ...doc.data() as Omit<UserInterface, "id">
  }))
  console.log(users);
  return users;
}
