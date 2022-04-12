import { ChangeDetectorRef, Component, OnInit, QueryList, ViewChildren } from '@angular/core';

import { Note } from '../../models/note';
import { NoteComponent } from '../note/note.component';
import { Observable, take } from "rxjs";
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

  constructor(private noteService: FirestoreNoteService, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getNotes();
    this.notes$.pipe(take(2)).subscribe(() => {
      setTimeout(() => window.scrollTo(0, document.body.scrollHeight));
    })
  }

  getNotes() {
    this.notes$ = this.noteService.getNotes();
  }


  createNote() {
    this.noteService.create();
    this.changeDetectorRef.detectChanges();
    this.noteComponents.last.focus();

    requestAnimationFrame(() => window.scrollTo(0, document.body.scrollHeight));
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

  trackNoteById(note: any): string {
    return note && note.id
  }
}
