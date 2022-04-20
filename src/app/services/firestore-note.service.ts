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
  queryFirstNotes = false;
  isLastNotes = false;
  indexStart!: FirestoreNote|null;
  indexEnd!: FirestoreNote|null;
  subscription!: Subscription;

  constructor(private firestore: AngularFirestore) {}

  create(): Promise<void> {
    const note = {
      createdAt: Date.now(),
      content: ''
    };

    return this.persist(note);
  }

  delete(note: Note) {
    this.notesCollection.doc(note.id).delete().then(() => console.log('delete'));
  }

  getNotes(): Observable<Note[]> {
    this.loadLast();
    return this.notes$.asObservable();
  }

  loadFirst(): void {
    this.isLastNotes = false;
    this.indexStart = null;
    this.indexEnd   = null;
    this.range      = this.step;
    this.fromEnd    = false;
    this.queryFirstNotes = true;
    this.refresh();
  }

  loadLast(): void {
    this.isLastNotes = true;
    this.indexStart = null;
    this.indexEnd   = null;
    this.range      = this.step;
    this.fromEnd    = true;
    this.queryFirstNotes = false;
    this.refresh();
  }

  loadNext(): void {
    this.range += this.isLastNotes ? 0 : this.step;
    this.fromEnd = false;
    this.refresh();
  }

  loadPrevious(): void {
    this.range += this.step;
    this.fromEnd = true;
    this.refresh();
  }

  persist(note: Note): Promise<void> {
    return new Promise<void>(resolve => {
      if (note.id) {
        this.notesCollection.doc(note.id).update(
          {
            updatedAt: note.updatedAt ? Timestamp.fromMillis(note.updatedAt) : undefined,
            content: note.content
          }
        ).then(() => resolve());

      } else {
        const firestoreNote = {
          createdAt: Timestamp.fromMillis(note.createdAt),
          content: note.content
        };

        this.indexEnd = firestoreNote;
        this.fromEnd  = true;
        this.range    = this.step;

        this.notesCollection.add({ ...firestoreNote })
          .then(() => resolve());
      }
    });
  }

  unloadNext(): void {
    this.isLastNotes = false;
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
            .orderBy('createdAt', 'desc')
            .startAt(this.indexEnd.createdAt);

        } else {
          newRef = newRef
            .orderBy('createdAt', 'asc')
            .startAt(this.indexStart.createdAt);
        }
      } else {
        newRef = newRef.orderBy('createdAt', this.queryFirstNotes ? 'asc' : 'desc');
      }

      return newRef;
      }
    );

    this.subscription = this.notesCollection.valueChanges({idField: 'id'}).pipe(
      tap(notes => {
        notes.sort((noteA, noteB) => noteA.createdAt > noteB.createdAt ? 1 : -1)
      }),

      tap(notes => {
        this.indexStart = notes[0];
        this.indexEnd   = notes[notes.length-1];
      }),

      map(notes => notes.map(note => { return {
        id:         note.id,
        createdAt:  note.createdAt.toMillis(),
        updatedAt:  note.updatedAt ? note.updatedAt.toMillis() : undefined,
        content:    note.content
      }})),

    ).subscribe(notes => {
      this.notes$.next(notes)
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
