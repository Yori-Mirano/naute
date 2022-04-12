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
      "date": 1649456839,
      "content": "1 Lorem ipsum"
    },
    {
      "date": 1649629639,
      "content": "2 Ipsum lorem"
    },
    {
      "date": 1649456839,
      "content": "3 Lorem ipsum"
    },
    {
      "date": 1649629639,
      "content": "4 Ipsum lorem"
    },
    {
      "date": 1649456839,
      "content": "5 Lorem ipsum"
    },

    {
      "date": 1649629639,
      "content": "6 Ipsum lorem"
    },
    {
      "date": 1649456839,
      "content": "7 Lorem ipsum"
    },
    {
      "date": 1649629639,
      "content": "8 Ipsum lorem"
    },
    {
      "date": 1649456839,
      "content": "9 Lorem ipsum"
    },
    {
      "date": 1649629639,
      "content": "10 Ipsum lorem"
    },

    {
      "date": 1649629639,
      "content": "11 Ipsum lorem"
    },
    {
      "date": 1649456839,
      "content": "12 Lorem ipsum"
    },
    {
      "date": 1649629639,
      "content": "13 Ipsum lorem"
    },
    {
      "date": 1649456839,
      "content": "14 Lorem ipsum"
    },
    {
      "date": 1649629639,
      "content": "15 Ipsum lorem"
    }
  ];
  notes$  = new BehaviorSubject<Note[]>([]);
  step    = 5;
  index   = { start: 0, end: 0 };

  constructor() {}

  create(): Note {
    const note = {
      date: Date.now(),
      content: ''
    };

    this.notes.push(note);
    this.loadLast();
    return note;
  };

  persist(note: Note): void {
    console.log('Persist note !', note);
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
