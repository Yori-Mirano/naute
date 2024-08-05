import {Injectable, OnDestroy} from '@angular/core';
import { Note } from '../models/note';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { BehaviorSubject, map, Observable, Subscription, take, tap } from 'rxjs';
import { NoteService } from "./note-service";
import { FirestoreNote } from "../models/firestore-note";
import { Timestamp } from "firebase/firestore";

@Injectable({
  providedIn: 'root'
})
export class FirestoreNoteService implements NoteService, OnDestroy {
  private notesCollection!: AngularFirestoreCollection<FirestoreNote>;

  private notes$  = new BehaviorSubject<Note[]>([]);
  step    = 5;
  range   = this.step;
  private fromEnd = true;
  private queryFirstNotes = false;
  private indexStart!: FirestoreNote|null;
  private indexEnd!: FirestoreNote|null;
  private subscription!: Subscription;
  private isBegin$ = new BehaviorSubject<boolean>(false);
  private isEnd$ = new BehaviorSubject<boolean>(false);
  isLoadingPrevious = false;
  isLoadingNext = false;

  constructor(private firestore: AngularFirestore) {}

  create(): Promise<void> {
    const note = {
      createdAt: Date.now(),
      content: '',
      cache: {
        title: '',
        tags: [],
      }
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

  getAllNotes(): Promise<Note[]> {
    return new Promise<Note[]>(resolve => {
      const notes$ = this.firestore.collection<FirestoreNote>('notes', ref => {
        return ref.orderBy('createdAt', 'asc').limit(100);
      }).get();

      notes$.pipe(
          take(1),
          map(querySnapshot => querySnapshot.docs.map(
            queryDocumentSnapshot => this.getNoteFromFirestoreNote(queryDocumentSnapshot.data())
          ))
        ).subscribe(notes => resolve(notes));
    });
  }

  loadFirst(): void {
    this.indexStart = null;
    this.indexEnd   = null;
    this.range      = this.step;
    this.fromEnd    = false;
    this.queryFirstNotes = true;
    this.isBegin$.next(true);
    this.isEnd$.next(false);
    this.refresh();
  }

  loadLast(): void {
    this.indexStart = null;
    this.indexEnd   = null;
    this.range      = this.step;
    this.fromEnd    = true;
    this.queryFirstNotes = false;
    this.isBegin$.next(false);
    this.isEnd$.next(true);
    this.refresh();
  }

  loadNext(): Promise<Note[]> {
    this.range += this.step;
    this.fromEnd = false;
    this.isLoadingNext = true;
    return this.refresh();
  }

  loadPrevious(): Promise<Note[]> {
    this.range += this.step;
    this.fromEnd = true;
    this.isLoadingPrevious = true;
    return this.refresh();
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

  unloadNext(): Promise<Note[]> {
    this.range -= this.step;
    this.range = Math.max(1, this.range);
    this.fromEnd = false;
    return this.refresh();
  }

  unloadPrevious(): Promise<Note[]> {
    this.range -= this.step;
    this.range = Math.max(1, this.range);
    this.fromEnd = true;
    return this.refresh();
  }

  refresh(): Promise<Note[]> {
    return new Promise<Note[]>(resolve => {
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
      });

      this.subscription = this.notesCollection.valueChanges({idField: 'id'}).pipe(
        tap(notes => {
          notes.sort((noteA, noteB) => noteA.createdAt > noteB.createdAt ? 1 : -1)
        }),

        tap(notes => {
          if (this.isLoadingPrevious) {
            this.isLoadingPrevious = false;
            this.isBegin$.next(this.fromEnd && this.indexStart?.id === notes[0].id);
          }

          if (this.isLoadingNext) {
            this.isLoadingNext = false;
            this.isEnd$.next(  !this.fromEnd && this.indexEnd?.id === notes[notes.length-1].id);
          }

          this.range      = notes.length;
          this.indexStart = notes[0];
          this.indexEnd   = notes[notes.length-1];
        }),

        map(notes => notes.map(note => { return this.getNoteFromFirestoreNote(note)})),

      ).subscribe(notes => {
        this.notes$.next(notes);
        resolve(notes);
      });
    });
  }

  getNoteFromFirestoreNote(firestoreNote: FirestoreNote): Note {
    return {
      id:         firestoreNote.id,
      createdAt:  firestoreNote.createdAt.toMillis(),
      updatedAt:  firestoreNote.updatedAt ? firestoreNote.updatedAt.toMillis() : undefined,
      content:    firestoreNote.content,
      cache: {
        title: '',
        tags: [],
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  isBegin(): BehaviorSubject<boolean> {
    return this.isBegin$;
  }

  isEnd(): BehaviorSubject<boolean> {
    return this.isEnd$;
  }
}
