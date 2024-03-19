import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

interface CurrencyApiObj {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
}

const CURRENCIES_PATH = 'currencies';

@Injectable({providedIn: 'root'})
export class CurrencyService {

  private readonly currencies$ = this.createCurrencyMap();

  constructor(private readonly apiService: ApiService) {}

  getCurrenciesMap(): Observable<Map<number, CurrencyApiObj>> {
    return this.currencies$;
  }

  private createCurrencyMap(): Observable<Map<number, CurrencyApiObj>> {
    const params = {ids: 'all'};

    return this.apiService
      .nonAuthenticatedFetch<CurrencyApiObj[]>(CURRENCIES_PATH, {params})
      .pipe(
        map((currencies) => {
          const currencyMap = new Map<number, CurrencyApiObj>();
          for (const currency of currencies) {
            currencyMap.set(currency.id, currency);
          }

          return currencyMap;
        }),
        shareReplay({bufferSize: 1, refCount: false}));
  }
}
