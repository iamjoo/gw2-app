import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';

import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {Coin} from '../inventory/coin';
import {CurrencyService} from '../api/currency_service';
import {WalletService} from '../api/wallet_service';

interface DataSourceObject {
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly amount: number;
}

@Component({
  selector: 'gw-wallet',
  templateUrl: './wallet.ng.html',
  styleUrls: ['./wallet.scss'],
  imports: [Coin, CommonModule, MatTableModule, MatTooltipModule],
  standalone: true,
})
export class Wallet {

  readonly data$ = this.createData();
  readonly displayedColumns = ['currency', 'amount'];

  constructor(
      private readonly currencyService: CurrencyService,
      private readonly walletService: WalletService,
  ) {}

  private createData(): Observable<DataSourceObject[]> {
    return combineLatest([
      this.currencyService.getCurrenciesMap(),
      this.walletService.getWallet(),
    ]).pipe(
      map(([currencyMap, wallet]) => {
        const data: DataSourceObject[] = [];
        for (const item of wallet) {
          const currency = currencyMap.get(item.id);
          if (!currency) {
            continue;
          }

          const currencyInWallet = {
            name: currency.name,
            description: currency.description,
            icon: currency.icon,
            amount: item.value,
          };
          data.push(currencyInWallet);
        }

        return data;
      }),
    );
  }
}
