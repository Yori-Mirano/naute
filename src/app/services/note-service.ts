import { Note } from "../models/note";
import { BehaviorSubject, Observable } from "rxjs";

export interface NoteService {
  create(): Promise<void>;
  persist(note: Note): Promise<void>;
  delete(note: Note): void
  getAllNotes(): Promise<Note[]>
  getNotes(step: number): Observable<Note[]>
  loadPrevious(step: number): Promise<Note[]>;
  loadNext(step: number): Promise<Note[]>;
  loadLast(step: number): void;
  loadFirst(step: number): void;
  unloadPrevious(step: number): Promise<Note[]>;
  unloadNext(step: number): Promise<Note[]>;
  isBegin(): BehaviorSubject<boolean>;
  isEnd(): BehaviorSubject<boolean>;
}
