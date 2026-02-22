import {doc, getDoc} from "firebase/firestore";
import {db} from "@/firebase.config";
import {SamplerInterface} from "@/src/interfaces";
import {QueryFunctionContext} from "@tanstack/query-core";

export async function SamplerMachine({queryKey}: QueryFunctionContext<string[]>) {
  const [key, id] = queryKey;
  const docRef = doc(db, "waterSamplers", id);
  const snapshot = await getDoc(docRef);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  const sampler: SamplerInterface = {id:snapshot.id, ...(snapshot.data() as Omit<SamplerInterface, "id">)}
  const res = await fetch(`http://${sampler.ip}:3000/`,{signal: controller.signal});
  clearTimeout(timeoutId);
  const samplerState = await res.json();
  sampler.status = samplerState.status;
  sampler.schedule = samplerState.schedule;
  return sampler;
}