import {doc, getDoc} from "firebase/firestore";
import {db} from "@/firebase.config";
import {SamplerInterface} from "@/src/interfaces";
import {QueryFunctionContext} from "@tanstack/query-core";

export async function SamplerMachine({queryKey}: QueryFunctionContext<string[]>) {
  const [key, id] = queryKey;
  const docRef = doc(db, "waterSamplers", id);
  const snapshot = await getDoc(docRef);

  const sampler: SamplerInterface = {id:snapshot.id, ...(snapshot.data() as Omit<SamplerInterface, "id">)}
  console.log(sampler.ip);
  const res = await fetch(`http://${sampler.ip}:3000/`);
  const samplerState = await res.json();
  sampler.status = samplerState.status;
  sampler.schedule = samplerState.schedule;
  return sampler;
}