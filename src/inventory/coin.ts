import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';

import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {FilesService} from '../api/files_service';

const COPPER_TO_GOLD = 10000;
const COPPER_TO_SILVER = 100;

interface CoinBreakdown {
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
  selector: 'gw-coin',
  templateUrl: './coin.ng.html',
  styleUrls: ['./coin.scss'],
  imports: [CommonModule],
  standalone: true,
})
export class Coin {

  private readonly amount$ = new BehaviorSubject<number>(0);

  readonly coinBreakdown$ = this.createCoinBreakdown();
  readonly icons$ = this.createIcons();

  @Input()
  set amount(amount: number) {
    this.amount$.next(amount ?? 0);
  }

  @Input() useLargeFont = false;

  constructor(private readonly filesService: FilesService) {}

  private createCoinBreakdown(): Observable<CoinBreakdown> {
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
    return this.filesService.getFilesMap().pipe(
        map((filesMap) => {
          const gold = filesMap.get('ui_coin_gold') ?? '';
          const silver = filesMap.get('ui_coin_silver') ?? '';
          const copper = filesMap.get('ui_coin_copper') ?? '';

          return {gold, silver, copper};
        }),
    );
  }
}
