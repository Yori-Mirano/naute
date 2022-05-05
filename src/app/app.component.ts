import { Component } from '@angular/core';
import { ExportNotesService } from "./services/export-notes.service";
import { FirestoreNoteService } from "./services/firestore-note.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'naute';

  constructor(
    private firestoreNoteService: FirestoreNoteService,
    private exportNotesService: ExportNotesService
  ) {}

  getZip() {
    this.firestoreNoteService.getAllNotes().then(notes => {
      this.exportNotesService.getZip(notes);
    });
  }
}
