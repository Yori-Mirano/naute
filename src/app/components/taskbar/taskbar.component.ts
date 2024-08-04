import { Component, Input, OnInit } from '@angular/core';
import { InMemoryNoteService } from "../../services/in-memory-note.service";
import { ExportNotesService } from "../../services/export-notes.service";
import { NotesComponent } from "../notes/notes.component";
import { skip, take } from "rxjs";

@Component({
  selector: 'app-taskbar',
  templateUrl: './taskbar.component.html',
  styleUrls: ['./taskbar.component.scss']
})
export class TaskbarComponent implements OnInit {

  @Input() notesComponent!: NotesComponent;

  constructor(
    private noteService: InMemoryNoteService,
    private exportNotesService: ExportNotesService,
) { }

  ngOnInit(): void {
  }

  createNote() {
    this.notesComponent.notes$.pipe(skip(1), take(1)).subscribe(() => {
      requestAnimationFrame(() => {
        this.notesComponent.noteComponents.last.focus();
        window.scrollTo(0, document.body.scrollHeight);
      });
    });

    this.noteService.create()
      .then(() => this.noteService.loadLast());
  }

  getZip() {
    this.noteService.getAllNotes().then(notes => {
      this.exportNotesService.getZip(notes);
    });
  }

  generate(count: number) {
    this.noteService.generate(count);
    this.noteService.refresh();
  }

}
