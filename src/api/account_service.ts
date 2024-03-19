import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

export interface AccountApiObj {
  readonly age: number;
  readonly created: string;
  readonly daily_ap: number;
  readonly fractal_level: number;
  readonly guilds: string[];
  readonly id: string;
  readonly monthly_ap: number;
  readonly name: string;
  readonly world: number;
  readonly wvw_rank: number;
}

const ACCOUNT_PATH = 'account';

@Injectable({providedIn: 'root'})
export class AccountService {
  private readonly account$ = this.createAccount();

  constructor(private readonly apiService: ApiService) {}

  getAccount(): Observable<AccountApiObj> {
    return this.account$;
  }

  private createAccount(): Observable<AccountApiObj> {
    return this.apiService.authenticatedFetch<AccountApiObj>(
        ACCOUNT_PATH).pipe(
        shareReplay({bufferSize: 1, refCount: false}),
        );
  }
}
