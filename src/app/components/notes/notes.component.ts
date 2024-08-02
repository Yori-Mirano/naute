import {
  ChangeDetectorRef,
  Component,
  ElementRef, OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';

import { Note } from '../../models/note';
import { NoteComponent } from '../note/note.component';
import { BehaviorSubject, Observable, skip, take } from "rxjs";
//import { FirestoreNoteService } from "../../services/firestore-note.service";
import { InMemoryNoteService } from "../../services/in-memory-note.service";
import { ExportNotesService } from "../../services/export-notes.service";

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit, OnDestroy {

  notes$!: Observable<Note[]>;
  isLoadingPrevious = false;
  isLoadingNext = false;
  autoloadLimitMax = 30;
  isBegin$?: BehaviorSubject<boolean>;
  isEnd$?: BehaviorSubject<boolean>;
  nowDate = new Date();
  nowDateInterval?: ReturnType<typeof setInterval>;

  @ViewChildren(NoteComponent) noteComponents!: QueryList<NoteComponent>;
  @ViewChild('list') listElementRef!: ElementRef;
  @ViewChild('scrollPositionAnchor') scrollPositionAnchor!: ElementRef;

  //constructor(private noteService: FirestoreNoteService) { }
  constructor(
    private noteService: InMemoryNoteService,
    private changeDetectorRef: ChangeDetectorRef,
    private exportNotesService: ExportNotesService
  ) { }

  ngOnInit(): void {
    this.getNotes();
    this.notes$.pipe(take(2)).subscribe(() => {
      requestAnimationFrame(() => window.scrollTo(0, document.body.scrollHeight));
    });

    this.isBegin$ = this.noteService.isBegin();
    this.isEnd$ = this.noteService.isEnd();

    this.nowDateInterval = setInterval(() => this.nowDate = new Date(), 1000);
  }

  ngOnDestroy(): void {
    if (this.nowDateInterval) {
      window.clearInterval(this.nowDateInterval);
    }
  }

  getNotes() {
    this.notes$ = this.noteService.getNotes(this.getInViewportNoteCount());
  }

  getInViewportNoteCount(): number {
    const limit = window.innerHeight / 110; // TODO: à calculer dynamiquement
    this.autoloadLimitMax = limit * 4;
    return limit;
  }

  createNote() {
    this.notes$.pipe(skip(1), take(1)).subscribe(() => {
      requestAnimationFrame(() => {
        this.noteComponents.last.focus();
        window.scrollTo(0, document.body.scrollHeight);
      });
    });

    this.noteService.create()
      .then(() => this.noteService.loadLast());
  }

  loadPreviousNotes() {
    this.isLoadingPrevious = true;
    this.noteService.loadPrevious(this.getInViewportNoteCount())
      .then(notes => {
        this.isLoadingPrevious = false;

        if (window.scrollY === 0) {
          window.scrollBy( 0, 1 );
        }

        this.ajustScrollPosition(); // FIXME: fix in WIP for Safari

        if (notes.length > this.autoloadLimitMax) {
          this.unloadNextNotes();
        }
      });
  }

  loadNextNotes() {
    this.isLoadingNext = true;
    this.noteService.loadNext(this.getInViewportNoteCount())
      .then(notes => {
        this.isLoadingNext = false;

        if (notes.length > this.autoloadLimitMax) {
          this.unloadPreviousNotes();
        }
      });
  }

  unloadPreviousNotes() {
    this.noteService.unloadPrevious(this.getInViewportNoteCount())
      .then(() => {
        this.ajustScrollPosition(); // FIXME: fix in WIP for Safari
      });
  }

  unloadNextNotes() {
    this.noteService.unloadNext(this.getInViewportNoteCount());
  }

  // FIXME: fix in WIP for Safari
  ajustScrollPosition() {
    const
      preScrollHeight = document.body.scrollHeight,
      preScrollOffset = window.scrollY;

    this.changeDetectorRef.detectChanges();

    const postScrollOffset = window.scrollY;

    if (
      preScrollOffset &&
      postScrollOffset &&
      ( preScrollOffset === postScrollOffset )
    ) {
      const
        postScrollHeight = document.body.scrollHeight,
        deltaHeight = ( postScrollHeight - preScrollHeight );

      window.scrollBy( 0, deltaHeight );

      console.log( "Scrolling by", deltaHeight, "px" );
    }
  }

  trackNoteById(index: number, note: any): string {
    return note && note.id;
  }

  private loadPreviousNotesIntervalRef!: any;
  private loadNextNotesIntervalRef!: any;

  onScrollTop(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadPreviousNotes();

        if (!this.isBegin$?.getValue()) {
          this.loadPreviousNotesIntervalRef = window.setInterval(() => this.loadPreviousNotes(), 1000);
        }
      } else {
        window.clearInterval(this.loadPreviousNotesIntervalRef);
      }
    })
  }

  onScrollBottom(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadNextNotes();

        if (!this.isEnd$?.getValue()) {
          this.loadNextNotesIntervalRef = window.setInterval(() => this.loadNextNotes(), 1000);
        }
      } else {
        window.clearInterval(this.loadNextNotesIntervalRef);
      }
    })
  }

  getZip() {
    this.noteService.getAllNotes().then(notes => {
      this.exportNotesService.getZip(notes);
    });
  }
}
