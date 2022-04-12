import { Timestamp } from "firebase/firestore";

export interface FirestoreNote {
  id?: string;
  date: Timestamp;
  content: string;
}
