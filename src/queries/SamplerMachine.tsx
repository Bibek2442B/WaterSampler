import {doc, getDoc} from "firebase/firestore";
import {db} from "@/firebase.config";
import {SamplerInterface} from "@/src/interfaces";
import {QueryFunctionContext} from "@tanstack/query-core";

export async function SamplerMachine({queryKey}: QueryFunctionContext<string[]>) {
  const [key, id] = queryKey;
  console.log(id);
  const docRef = doc(db, "waterSamplers", id);
  const snapshot = await getDoc(docRef);

  const sampler: SamplerInterface = {id:snapshot.id, ...(snapshot.data() as Omit<SamplerInterface, "id">)}
  console.log(sampler);
  try{
    console.log("Hello");
    const res = await fetch(`http://${sampler.ip}:3000/`);
    console.log("Hello2");
    const samplerState = await res.json();
    sampler.status = samplerState.status;
    sampler.schedule = samplerState.schedule;
  }catch(e){
    console.log(e);
  }
  return sampler;
}