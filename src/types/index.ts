import {Timestamp} from "@firebase/firestore";

export interface MyUserType {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "OPERATOR" | "VIEWER";
  emailVerified: boolean;
  approvedByAdmin: boolean;
  createdAt: Timestamp;
}

export interface MyScheduleType {
  startTime: Timestamp,
  bursts: number,
  intervalMinutes: number,
}

export interface MyRuntimeType {
  startTime: Timestamp,
  endTime: Timestamp,
}

export interface MyErrorType {
  hasError: boolean,
  errorMessage?: string,
}

export interface MySamplerType {
  name: string,
  address: string,
  status: string,
  phone: string,
  schedule?: MyScheduleType,
  runtime?: MyRuntimeType,
  error?: MyErrorType,
}