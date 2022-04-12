import { TestBed } from '@angular/core/testing';

import { FirestoreNoteService } from './firestore-note.service';

describe('FirestoreNoteService', () => {
  let service: FirestoreNoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirestoreNoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
