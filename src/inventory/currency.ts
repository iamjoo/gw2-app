import {Component, Input} from '@angular/core';

import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ApiService} from '../api/api';

const COPPER_TO_GOLD = 10000;
const COPPER_TO_SILVER = 100;

interface CurrencyInfo {
  readonly gold: number;
  readonly silver: number;
  readonly copper: number;
  // For debugging only
  readonly total: number;
}

interface Icon {
  readonly gold: string;
  readonly silver: string;
  readonly copper: string;
}

@Component({
  selector: 'gw-currency',
  templateUrl: './currency.ng.html',
  styleUrls: ['./currency.scss']
})
export class Currency {

  private readonly amount$ = new BehaviorSubject<number>(0);

  readonly currencyBreakdown$ = this.createCurrencyBreakdown();
  readonly icons$ = this.createIcons();

  @Input()
  set amount(amount: number) {
    this.amount$.next(amount ?? 0);
  }

  constructor(private readonly apiService: ApiService) {}

  private createCurrencyBreakdown(): Observable<CurrencyInfo> {
    return this.amount$.pipe(
        map((amount) => {
          const gold = Math.floor(amount / COPPER_TO_GOLD);
          const silver = Math.floor(amount / COPPER_TO_SILVER) % 100;
          const copper = amount % 100;
          const total = amount;

          return {gold, silver, copper, total};
        }),
    );
  }

  private createIcons(): Observable<Icon> {
    return this.apiService.getFilesMap().pipe(
        map((filesMap) => {
          const gold = filesMap.get('ui_coin_gold') ?? '';
          const silver = filesMap.get('ui_coin_silver') ?? '';
          const copper = filesMap.get('ui_coin_copper') ?? '';

          return {gold, silver, copper};
        }),
    );
  }
}
