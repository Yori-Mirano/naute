import {Injectable, OnDestroy} from '@angular/core';
import { Note } from '../models/note';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { BehaviorSubject, map, Observable, Subscription, tap } from 'rxjs';
import { NoteService } from "./note-service";
import { FirestoreNote } from "../models/firestore-note";
import { Timestamp } from "firebase/firestore";

@Injectable({
  providedIn: 'root'
})
export class FirestoreNoteService implements NoteService, OnDestroy {
  private notesCollection!: AngularFirestoreCollection<FirestoreNote>;

  notes$  = new BehaviorSubject<Note[]>([]);
  step    = 5;
  range   = this.step;
  fromEnd = true;
  indexStart!: FirestoreNote;
  indexEnd!: FirestoreNote;
  subscription!: Subscription;

  constructor(private firestore: AngularFirestore) {}

  create(): Note { // Promise<DocumentReference<Note>>
    const note = {
      date: Date.now(),
      content: ''
    };

    const firestoreNote = {
      date: Timestamp.now(),
      content: ''
    };

    this.indexEnd = firestoreNote;
    this.fromEnd  = true;
    this.range    = this.step;

    this.notesCollection.add({ ...firestoreNote })
      .then(() => this.loadLast());

    return note;
  }

  delete(note: Note) {
    this.notesCollection.doc(note.id).delete().then(() => console.log('delete'));
  }

  getNotes(): Observable<Note[]> {
    this.loadLast();
    return this.notes$.asObservable();
  }

  loadFirst(): void {
  }

  loadLast(): void {
    this.refresh();
  }

  loadNext(): void {
    this.range += this.step;
    this.fromEnd = false;
    this.refresh();
  }

  loadPrevious(): void {
    this.range += this.step;
    this.fromEnd = true;
    this.refresh();
  }

  persist(note: Note): void {
    this.notesCollection.doc(note.id).update({content: note.content});
  }

  unloadNext(): void {
    this.range -= this.step;
    this.range = Math.max(1, this.range);
    this.fromEnd = false;
    this.refresh();
  }

  unloadPrevious(): void {
    this.range -= this.step;
    this.range = Math.max(1, this.range);
    this.fromEnd = true;
    this.refresh();
  }

  refresh(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.notesCollection = this.firestore.collection<FirestoreNote>('notes', ref => {
      let newRef = ref.limit(this.range);

      if (this.indexStart && this.indexEnd) {
        if (this.fromEnd) {
          newRef = newRef
            .orderBy('date', 'desc')
            .startAt(this.indexEnd.date);

        } else {
          newRef = newRef
            .orderBy('date', 'asc')
            .startAt(this.indexStart.date);
        }
      } else {
        newRef = newRef.orderBy('date', 'desc');
      }

      return newRef;
      }
    );

    this.subscription = this.notesCollection.valueChanges({idField: 'id'}).pipe(
      tap(notes => {
        notes.sort((noteA, noteB) => noteA.date > noteB.date ? 1 : -1)
      }),

      tap(notes => {
        this.indexStart = notes[0];
        this.indexEnd   = notes[notes.length-1];
      }),

      map(notes => notes.map(note => { return {
        id:       note.id,
        date:     note.date.seconds * 1000,
        content:  note.content
      }})),

    ).subscribe(notes => {
      this.notes$.next(notes)
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
