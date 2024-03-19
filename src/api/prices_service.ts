import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';

import {ApiService} from './api';

interface PriceApiObj {
  readonly id: number;
  readonly buys: BuySellApiObj;
  readonly sells: BuySellApiObj;
}

interface BuySellApiObj {
  readonly unit_price: number;
  readonly quantity: number;
}

const PRICES_PATH = 'commerce/prices';

@Injectable({providedIn: 'root'})
export class PricesService {

  constructor(private readonly apiService: ApiService) {}

  getPrices(id: number): Observable<PriceApiObj> {
    return this.apiService.nonAuthenticatedFetch<PriceApiObj>(
        `${PRICES_PATH}/${id}`);
  }
}
