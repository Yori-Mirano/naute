import { TestBed } from '@angular/core/testing';

import { ExportNotesService } from './export-notes.service';

describe('ExportNotesService', () => {
  let service: ExportNotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportNotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
