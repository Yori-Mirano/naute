import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';

import { Note } from '../../models/note';
import { NoteComponent } from '../note/note.component';
import { BehaviorSubject, Observable, skip, take } from "rxjs";
import { InMemoryNoteService } from "../../services/in-memory-note.service";

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {

  notes$!: Observable<Note[]>;
  isLoadingPrevious = false;
  isLoadingNext = false;
  autoloadLimitMax = 30;
  isBegin$?: BehaviorSubject<boolean>;
  isEnd$?: BehaviorSubject<boolean>;

  @ViewChildren(NoteComponent) noteComponents!: QueryList<NoteComponent>;
  @ViewChild('list') listElementRef!: ElementRef;
  @ViewChild('scrollPositionAnchor') scrollPositionAnchor!: ElementRef;

  constructor(
    private noteService: InMemoryNoteService,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.getNotes();
    this.notes$.pipe(take(2)).subscribe(() => {
      requestAnimationFrame(() => window.scrollTo(0, document.body.scrollHeight));
    });

    this.isBegin$ = this.noteService.isBegin();
    this.isEnd$ = this.noteService.isEnd();
  }

  getNotes() {
    this.notes$ = this.noteService.getNotes(this.getInViewportNoteCount());
  }

  getInViewportNoteCount(): number {
    const limit = window.innerHeight / 110; // TODO: à calculer dynamiquement
    this.autoloadLimitMax = limit * 4;
    return limit;
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
}
