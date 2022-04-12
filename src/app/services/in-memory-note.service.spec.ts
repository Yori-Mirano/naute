import { TestBed } from '@angular/core/testing';

import { InMemoryNoteService } from './in-memory-note.service';

describe('InMemoryNoteService', () => {
  let service: InMemoryNoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InMemoryNoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
