import {Component} from '@angular/core';

import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ApiService} from '../api/api';

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
})
export class Wallet {

  readonly data$ = this.createData();
  readonly displayedColumns = ['currency', 'amount'];

  constructor(private readonly apiService: ApiService) {
    this.apiService.getCurrenciesMap().subscribe(a => console.log(a));
    this.apiService.getWallet().subscribe(a => console.log(a));
  }

  private createData(): Observable<DataSourceObject[]> {
    return combineLatest([
      this.apiService.getCurrenciesMap(),
      this.apiService.getWallet(),
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
