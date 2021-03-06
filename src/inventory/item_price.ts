import {Component, Input} from '@angular/core';

import {BehaviorSubject, Observable, of as observableOf} from 'rxjs';
import {catchError, filter, map, switchMap, withLatestFrom} from 'rxjs/operators';

import {ApiService} from '../api/api';
import {ItemApiObj} from '../api/models';

interface PriceInfo {
  readonly totalSellAmount: number;
  readonly singleSellAmount: number;
  readonly singleBuyAmount: number;
}

@Component({
  selector: 'gw-item-price',
  templateUrl: './item_price.ng.html',
  styleUrls: ['./item_price.scss']
})
export class ItemPrice {

  private readonly item$ = new BehaviorSubject<ItemApiObj|null>(null);
  private readonly itemCount$ = new BehaviorSubject<number>(0);

  readonly prices$ = this.createPrices();

  constructor(private readonly apiService: ApiService) {}

  @Input()
  set itemCount(count: number|undefined) {
    this.itemCount$.next(count ?? 0);
  }

  @Input()
  set item(item: ItemApiObj|undefined) {
    this.item$.next(item ?? null);
  }

  private createPrices(): Observable<PriceInfo|null> {
    return this.item$.pipe(
        filter((item): item is ItemApiObj => !!item),
        switchMap((item) => {
          return this.apiService.getPrices(item.id).pipe(
              catchError(() => observableOf(null)),
          );
        }),
        withLatestFrom(this.itemCount$),
        map(([priceInfo, count]) => {
          if (!priceInfo) {
            return null;
          }

          const totalSellAmount = count * priceInfo.buys.unit_price;
          const singleSellAmount = priceInfo.buys.unit_price;
          const singleBuyAmount = priceInfo.sells.unit_price;

          return {totalSellAmount, singleSellAmount, singleBuyAmount};
        }),
    );
  }
}
