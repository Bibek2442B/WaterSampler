import {Timestamp} from "@firebase/firestore";
import {User} from "firebase/auth";
import { DocumentData, QueryDocumentSnapshot } from "@firebase/firestore";

export interface UserInterface {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "OPERATOR" | "VIEWER";
  emailVerified: boolean;
  approvedByAdmin: boolean;
  createdAt: Timestamp;
}

export interface ScheduleInterface {
  scheduledBy: UserInterface,
  startTime: Timestamp,
  bursts: number,
  intervalMinutes: number,
}

export interface RuntimeInterface {
  startTime: Timestamp,
  endTime: Timestamp,
}

export interface ErrorInterface {
  hasError: boolean,
  errorMessage?: string,
}

export interface SamplerInterface {
  id: string,
  name: string,
  address: string,
  ip: string,
  status: "FREE" | "SCHEDULED" | "TAKING_SAMPLE" | "HAS_SAMPLE" | "ERROR",
  schedule?: ScheduleInterface,
  error?: ErrorInterface,
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