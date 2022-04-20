import { Note } from "../models/note";
import { Observable } from "rxjs";

export interface NoteService {
  create(): Promise<void>;
  persist(note: Note): Promise<void>;
  delete(note: Note): void
  getNotes(): Observable<Note[]>
  loadPrevious(): void;
  loadNext(): void;
  loadLast(): void;
  loadFirst(): void;
  unloadPrevious(): void;
  unloadNext(): void;
}
