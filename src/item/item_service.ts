import {Injectable} from '@angular/core';

import {Observable, of as observableOf} from 'rxjs';
import {shareReplay, tap} from 'rxjs/operators';

import {ApiService} from '../api/api';
import {ItemApiObj} from '../api/models';

@Injectable({
  providedIn: 'root',
})
export class ItemService {

  readonly idToItemObs = new Map<number, Observable<ItemApiObj>>();

  constructor(
      private readonly apiService: ApiService,
  ) {}

  getItem(id: number): Observable<ItemApiObj> {
    if (!this.idToItemObs.has(id)) {
      const item$ = this.apiService.getItem(id).pipe(
          shareReplay({bufferSize: 1, refCount: false}),
          );
      this.idToItemObs.set(id, item$);
    }

    return this.idToItemObs.get(id)!;
  }
}
