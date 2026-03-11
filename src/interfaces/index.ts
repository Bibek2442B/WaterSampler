import {Timestamp} from "@firebase/firestore";
import {User} from "firebase/auth";
import { DocumentData, QueryDocumentSnapshot } from "@firebase/firestore";


export interface ScheduleInterface {
  scheduledAt: Timestamp,
  bursts: number,
  intervalMinutes: number,
  volume: number,
  endsAt: Timestamp,
}

export interface SamplerInterface {
  id: string,
  name: string,
  address: string,
  ip: string,
  status?: "FREE" | "SCHEDULED" | "TAKING_SAMPLE" | "HAS_SAMPLE" | "ERROR",
  schedule?: ScheduleInterface,
}

export interface UserInterface {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "OPERATOR" | "VIEWER";
  emailVerified: boolean;
  approvedByAdmin: boolean;
  samplers: string[];
  createdAt: Timestamp;
}


export interface AuthContextInterface {
  user: User | null;
  userDoc: UserInterface | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface SamplersPage {
  samplers: SamplerInterface[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}