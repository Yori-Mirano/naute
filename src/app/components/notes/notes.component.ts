import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';

import { Note } from '../../models/note';
import { NoteComponent } from '../note/note.component';
import { Observable, skip, take } from "rxjs";
import { FirestoreNoteService } from "../../services/firestore-note.service";

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {

  notes!: Note[];
  notes$!: Observable<Note[]>;

  @ViewChildren(NoteComponent) noteComponents!: QueryList<NoteComponent>;

  constructor(private noteService: FirestoreNoteService) { }

  ngOnInit(): void {
    this.getNotes();
    this.notes$.pipe(take(2)).subscribe(() => {
      setTimeout(() => window.scrollTo(0, document.body.scrollHeight));
    });
  }

  getNotes() {
    this.notes$ = this.noteService.getNotes();
  }


  createNote() {
    this.notes$.pipe(skip(1), take(1)).subscribe(() => {
      requestAnimationFrame(() => {
        this.noteComponents.last.focus();
        window.scrollTo(0, document.body.scrollHeight)
      });
    });

    this.noteService.create()
      .then(() => this.noteService.loadLast());
  }

  loadPreviousNotes() {
    this.noteService.loadPrevious();
  }

  loadNextNotes() {
    this.noteService.loadNext();
  }

  unloadPreviousNotes() {
    this.noteService.unloadPrevious();
  }

  unloadNextNotes() {
    this.noteService.unloadNext();
  }

  trackNoteById(index: number, note: any): string {
    return note && note.id;
  }
}
