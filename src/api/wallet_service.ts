import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

interface WalletApiObj {
  readonly id: number; // use /v2/currencies
  readonly value: number;
}

const WALLET_PATH = 'account/wallet';

@Injectable({providedIn: 'root'})
export class WalletService {

  private readonly wallet$ = this.createWallet();

  constructor(private readonly apiService: ApiService) {}

  getWallet(): Observable<WalletApiObj[]> {
    return this.wallet$;
  }

  private createWallet(): Observable<WalletApiObj[]> {
    return this.apiService.authenticatedFetch<WalletApiObj[]>(
        WALLET_PATH).pipe(
        shareReplay({bufferSize: 1, refCount: false}),
        );
  }
}
