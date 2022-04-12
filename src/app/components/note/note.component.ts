import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Note } from '../../models/note';
import { FirestoreNoteService } from "../../services/firestore-note.service";

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit, OnChanges {
  @ViewChild('textarea') textarea!: ElementRef;
  @Input() note!: Note;
  autosaveTimeout!: ReturnType<typeof setTimeout>;

  constructor(private noteService: FirestoreNoteService) { }

  ngOnInit(): void {
    requestAnimationFrame(() => {
      this.textarea.nativeElement.blur()
      this.ajustHeight();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    requestAnimationFrame(() => {
      this.ajustHeight();
    });
  }

  focus() {
    requestAnimationFrame(() => {
      this.textarea.nativeElement.select();
      this.textarea.nativeElement.focus()
    });
  }

  autosave() {
    clearTimeout(this.autosaveTimeout);

    this.autosaveTimeout = setTimeout(() => {
      this.save();
    }, 3000);
  }

  save() {
    console.log('note save');
    clearTimeout(this.autosaveTimeout);
    this.noteService.persist(this.note);
  }

  delete() {
    this.noteService.delete(this.note);
  }

  ajustHeight() {
    const el = this.textarea.nativeElement;
    el.style.height = '';
    el.style.height = el.scrollHeight + 'px';
  }
}
