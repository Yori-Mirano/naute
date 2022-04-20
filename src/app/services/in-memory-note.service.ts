import { Injectable } from '@angular/core';
import { NoteService } from "./note-service";
import { Note } from "../models/note";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class InMemoryNoteService implements NoteService{
  notes: Note[] = [
    {
      "createdAt": 1649456839,
      "content": "1 Lorem ipsum"
    },
    {
      "createdAt": 1649629639,
      "content": "2 Ipsum lorem"
    },
    {
      "createdAt": 1649456839,
      "content": "3 Lorem ipsum"
    },
    {
      "createdAt": 1649629639,
      "content": "4 Ipsum lorem"
    },
    {
      "createdAt": 1649456839,
      "content": "5 Lorem ipsum"
    },

    {
      "createdAt": 1649629639,
      "content": "6 Ipsum lorem"
    },
    {
      "createdAt": 1649456839,
      "content": "7 Lorem ipsum"
    },
    {
      "createdAt": 1649629639,
      "content": "8 Ipsum lorem"
    },
    {
      "createdAt": 1649456839,
      "content": "9 Lorem ipsum"
    },
    {
      "createdAt": 1649629639,
      "content": "10 Ipsum lorem"
    },

    {
      "createdAt": 1649629639,
      "content": "11 Ipsum lorem"
    },
    {
      "createdAt": 1649456839,
      "content": "12 Lorem ipsum"
    },
    {
      "createdAt": 1649629639,
      "content": "13 Ipsum lorem"
    },
    {
      "createdAt": 1649456839,
      "content": "14 Lorem ipsum"
    },
    {
      "createdAt": 1649629639,
      "content": "15 Ipsum lorem"
    }
  ];
  notes$  = new BehaviorSubject<Note[]>([]);
  step    = 5;
  index   = { start: 0, end: 0 };

  constructor() {}

  create(): Promise<void> {
    const note = {
      createdAt: Date.now(),
      content: ''
    };

    return this.persist(note);
  };

  persist(note: Note): Promise<void> {
    return new Promise(resolve => {
      console.log('Persist note !', note);
      this.notes.push(note);
      resolve();
    });
  }


  getNotes(): Observable<Note[]> {
    this.loadLast();
    return this.notes$.asObservable();
  }


  loadFirst(): void {
    this.index.start  = 0;
    this.index.end    = this.step;
    this.refresh();
  };

  loadLast(): void {
    this.index.start  = this.notes.length - this.step;
    this.index.end    = this.notes.length;
    this.refresh();
  };


  loadNext(): void {
    this.index.end = Math.min(this.notes.length, this.index.end + this.step);
    this.refresh();
  };

  loadPrevious(): void {
    this.index.start = Math.max(0, this.index.start - this.step);
    this.refresh();
  }


  unloadNext(): void {
    this.index.end = Math.max(this.index.start, this.index.end - this.step);
    this.refresh();
  }

  unloadPrevious(): void {
    this.index.start = Math.min(this.index.end, this.index.start + this.step);
    this.refresh();
  }


  refresh(): void {
    this.notes$.next(
      this.notes.slice(this.index.start, this.index.end)
    );
  }

  delete(note: Note): void {
    // TODO: implement
  }
}
