import { Injectable } from '@angular/core';
import { NoteService } from "./note-service";
import { Note } from "../models/note";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class InMemoryNoteService implements NoteService{
  notes: Note[] = [];
  notes$  = new BehaviorSubject<Note[]>([]);
  step    = 10;
  index   = { start: 0, end: 0 };

  private isBegin$ = new BehaviorSubject<boolean>(false);
  private isEnd$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.generate(10);
  }

  generate(count: number) {
    const loremIpsumParagraph = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

    for (let i = 0; i < count; i++) {
      const month = this.pad(Math.floor(Math.random() * 12) + 1);
      const day = this.pad(Math.floor(Math.random() * 30) + 1);
      const hours = this.pad(Math.floor(Math.random() * 24));
      const minutes = this.pad(Math.floor(Math.random() * 60));

      this.notes.push({
        id: `${i}`,
        createdAt: Date.parse(`2022-${month}-${day}T${hours}:${minutes}`),
        content: ''
      });
    }

    this.notes.sort((noteA, noteB) => noteA.createdAt > noteB.createdAt ? 1 : -1)

    this.notes.forEach((note, index) => {
      let content = `# Lorem ipsum ${index+1}`;

      for (let line = 0, lineMax = Math.random() * 5; line < lineMax; line++) {
        content += '\n\n';
        content += loremIpsumParagraph.slice(0, Math.floor(Math.random() * loremIpsumParagraph.length)) + '.';
      }

      note.content = content;
      //note.content = `${index + 1}`; // TODO: remove
    })
  }

  pad(n: number): string {
    return (n < 10 ? `0${n}` : `${n}`);
  }

  create(): Promise<void> {
    const note = {
      id: `${this.notes.length}`,
      createdAt: Date.now(),
      content: ''
    };

    return this.persist(note);
  };

  persist(note: Note): Promise<void> {
    return new Promise(resolve => {
      console.log('Persist note !', note);
      const noteIndex = this.notes.indexOf(note);

      if (noteIndex >= 0) {
        this.notes[noteIndex] = note;
      } else {
        this.notes.push(note);
      }

      resolve();
    });
  }


  getNotes(step = 0): Observable<Note[]> {
    this.loadLast(step || this.step);
    return this.notes$.asObservable();
  }


  loadFirst(step = 0): void {
    this.index.start  = 0;
    this.index.end    = step || this.step;
    this.refresh();
  };

  loadLast(step = 0): void {
    this.index.start  = this.notes.length - (step || this.step);
    this.index.end    = this.notes.length;
    this.refresh();
  };


  loadNext(step = 0): Promise<Note[]> {
    this.index.end = Math.min(this.notes.length, this.index.end + (step || this.step));
    return this.refresh();
  };

  loadPrevious(step = 0): Promise<Note[]> {
    this.index.start = Math.max(0, this.index.start - (step || this.step));
    return this.refresh();
  }


  unloadNext(step = 0): Promise<Note[]> {
    this.index.end = Math.max(this.index.start, this.index.end - (step || this.step));
    return this.refresh();
  }

  unloadPrevious(step = 0): Promise<Note[]> {
    this.index.start = Math.min(this.index.end, this.index.start + (step || this.step));
    return this.refresh();
  }


  refresh(): Promise<Note[]> {
    return new Promise<Note[]>(resolve => {
      this.isBegin$.next(this.index.start == 0);
      this.isEnd$.next(this.index.end == this.notes.length);

      const notes = this.notes.slice(this.index.start, this.index.end);
      this.notes$.next(notes);
      resolve(notes);
    })
  }

  delete(note: Note): void {
    const noteId = note.id;
    this.notes.splice(this.notes.indexOf(note), 1);
    this.refresh().then(() => console.log(`Note ${noteId} deleted`));
  }

  getAllNotes(): Promise<Note[]> {
    return Promise.resolve(this.notes);
  }

  isBegin(): BehaviorSubject<boolean> {
    return this.isBegin$;
  }

  isEnd(): BehaviorSubject<boolean> {
    return this.isEnd$;
  }
}
