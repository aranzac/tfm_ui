import { TestBed } from '@angular/core/testing';

import { ProcesaHttpMsjServiceService } from './procesa-http-msj-service.service';

describe('ProcesaHttpMsjServiceService', () => {
  let service: ProcesaHttpMsjServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcesaHttpMsjServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
