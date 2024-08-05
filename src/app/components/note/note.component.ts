import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Note } from '../../models/note';
//import { FirestoreNoteService } from "../../services/firestore-note.service";

import * as HyperMD from 'hypermd';
import { cm_t } from "hypermd";
import { InMemoryNoteService } from "../../services/in-memory-note.service";
import slugify from "slugify";

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

  //constructor(private noteService: FirestoreNoteService) { }
  constructor(private noteService: InMemoryNoteService) { }

  ngOnInit(): void {
    requestAnimationFrame(() => {
      this.editor = HyperMD.fromTextArea(this.textarea.nativeElement, {
        lineNumbers: false,
        viewportMargin: Infinity,
        viewportScrollMarginTop: 100,
        viewportScrollMarginBottom: 150,
        extraKeys: {
          "Esc": () => this.triggerEditorBlur(),
          "Ctrl-S": () => {
            if (!navigator.platform.match("Mac")) {
              this.save()
            }
          },

          "Cmd-S": () => this.save()
        }
      });

      this.editor.on('change',  () => this.onChange());
      this.editor.on('blur',    () => this.onBlur());

      // Forces to recalculate the visual position of the cursor after a blur which would have hidden a nearby token.
      this.editor.on('focus',   () => requestAnimationFrame(() => this.editor.refresh()));
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.editor) {
      const previousNote = changes['note'].previousValue;
      const currentNote  = changes['note'].currentValue;


      if (this.isExternalUpdate(currentNote)) {
        this.editor.setValue(changes['note'].currentValue.content);
      }
    }
  }

  isExternalUpdate(currentNote: Note): boolean {
    return this.savedAt !== currentNote.updatedAt;
  }

  focus() {
    requestAnimationFrame(() => {
      this.editor.focus();
    });
  }

  triggerEditorBlur() {
    this.textarea.nativeElement.parentNode.querySelector('.CodeMirror textarea')?.blur();
  }

  onBlur() {
    if (this.editor.getValue() === '') {
      this.delete();
    } else {
      this.save();
    }
  }

  onChange() {
    this.autosave();
  }

  cacheTitle() {
    const titleMatch = this.note.content.match(/^# (?<title>.*)(?:\n|$)/);

    if (titleMatch && titleMatch.groups && titleMatch?.groups['title']) {
      this.note.cache.title = titleMatch?.groups['title'];
    }
  }

  cacheTags() {
    const hashtags = [...this.note.content.matchAll(/#(\w+)/g)];

    if (hashtags) {
      this.note.cache.tags = hashtags.map(tag => tag[1]);
    }
  }

  autosave() {
    this.clearAutosaveTimeout();
    this.autosaveTimeout = setTimeout(() => this.save(), this.autosaveDelay);
  }

  clearAutosaveTimeout(): void {
    clearTimeout(this.autosaveTimeout);
  }

  save() {
    const previous = this.note.content;
    const current  = this.editor.getValue();

    if (current !== previous) {
      console.log('saved');
      clearTimeout(this.autosaveTimeout);
      this.note.content = this.editor.getValue();
      this.note.updatedAt = this.savedAt = Date.now();
      this.cacheTitle();
      this.cacheTags();
      this.noteService.persist(this.note);

    } else {
      //console.log('nothing to save');
    }
  }

  delete() {
    this.clearAutosaveTimeout();
    this.noteService.delete(this.note);
  }
}
