import { Timestamp } from "firebase/firestore";

export interface FirestoreNote {
  id?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  content: string;
}
