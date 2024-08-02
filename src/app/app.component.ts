import { Component } from '@angular/core';
import { ExportNotesService } from "./services/export-notes.service";
import { FirestoreNoteService } from "./services/firestore-note.service";
import { InMemoryNoteService } from "./services/in-memory-note.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'naute';
}
