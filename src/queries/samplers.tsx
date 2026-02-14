import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/firebase.config";
import { SamplerInterface } from "@/src/interfaces";

const PAGE_SIZE = 10;

export async function fetchSamplersPage(
  pageParam: QueryDocumentSnapshot<DocumentData> | null
) {
  const baseQuery = query(
    collection(db, "waterSamplers"),
    orderBy("createdAt", "desc"),
    limit(PAGE_SIZE)
  );

  const q = pageParam
    ? query(baseQuery, startAfter(pageParam))
    : baseQuery;

  const snapshot = await getDocs(q);

  const samplers: SamplerInterface[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<SamplerInterface, "id">),
  }));

  return {
    samplers: samplers,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null,
  };
}
