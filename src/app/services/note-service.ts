import { Note } from "../models/note";
import { Observable } from "rxjs";

export interface NoteService {
  create(): Note;
  persist(note: Note): void;
  delete(note: Note): void
  getNotes(): Observable<Note[]>
  loadPrevious(): void;
  loadNext(): void;
  loadLast(): void;
  loadFirst(): void;
  unloadPrevious(): void;
  unloadNext(): void;
}
