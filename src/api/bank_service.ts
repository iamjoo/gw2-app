import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

interface BankApiObj {
  readonly id: number;
  readonly count: number;
}

const BANK_PATH = 'account/bank';

@Injectable({providedIn: 'root'})
export class BankService {

  private readonly bank$ = this.createBank();

  constructor(private readonly apiService: ApiService) {}

  getBank(): Observable<BankApiObj[]> {
    return this.bank$;
  }

  private createBank(): Observable<BankApiObj[]> {
    return this.apiService.authenticatedFetch<BankApiObj[]>(
        BANK_PATH).pipe(
        shareReplay({bufferSize: 1, refCount: false}),
        );
  }
}
