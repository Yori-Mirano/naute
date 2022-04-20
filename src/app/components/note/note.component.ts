import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Note } from '../../models/note';
import { FirestoreNoteService } from "../../services/firestore-note.service";

import * as HyperMD from 'hypermd';
import { cm_t } from "hypermd";

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit, OnChanges {
  @ViewChild('textarea') textarea!: ElementRef;
  @Input() note!: Note;
  autosaveDelay = 1000;
  autosaveTimeout!: ReturnType<typeof setTimeout>;
  editor!: cm_t;
  savedAt!: number;

  constructor(private noteService: FirestoreNoteService) { }

  ngOnInit(): void {
    requestAnimationFrame(() => {
      this.editor = HyperMD.fromTextArea(this.textarea.nativeElement, {
        lineNumbers: false,
        viewportMargin: Infinity,
        viewportScrollMarginTop: 100,
        viewportScrollMarginBottom: 150,
        extraKeys: {
          "Esc": () => this.blur(),
          "Ctrl-S": () => {
            if (!navigator.platform.match("Mac")) {
              this.save()
            }
          },

          "Cmd-S": () => this.save()
        }
      });

      this.editor.on('change',  () => this.autosave());
      this.editor.on('blur',    () => this.save());

      // Forces to recalculate the visual position of the cursor after a blur which would have hidden a nearby token.
      this.editor.on('focus',   () => requestAnimationFrame(() => this.editor.refresh()));
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.editor) {
      const previousNote = changes['note'].previousValue;
      const currentNote  = changes['note'].currentValue;


      if (this.isExternalUpdate(previousNote, currentNote)) {
        this.editor.setValue(changes['note'].currentValue.content);
      }
    }
  }

  isExternalUpdate(previousDate: Note, currentNote: Note): boolean {
    return this.savedAt !== currentNote.updatedAt;
  }

  focus() {
    requestAnimationFrame(() => {
      this.editor.focus();
    });
  }

  blur() {
    this.textarea.nativeElement.parentNode.querySelector('.CodeMirror textarea')?.blur();
  }

  autosave() {
    clearTimeout(this.autosaveTimeout);
    this.autosaveTimeout = setTimeout(() => this.save(), this.autosaveDelay);
  }

  save() {
    const previous = this.note.content;
    const current  = this.editor.getValue();

    if (current !== previous) {
      console.log('saved');
      clearTimeout(this.autosaveTimeout);
      this.note.content = this.editor.getValue();
      this.note.updatedAt = this.savedAt = Date.now();
      this.noteService.persist(this.note);

    } else {
      console.log('nothing to save');
    }
  }

  delete() {
    this.noteService.delete(this.note);
  }
}
