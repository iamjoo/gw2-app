import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

interface SharedInventoryApiObj {
  readonly id: number;
  readonly count: number;
}

const INVENTORY_PATH = 'account/inventory';

@Injectable({providedIn: 'root'})
export class SharedInventoryService {

  private readonly sharedInventory$ = this.createSharedInventory();

  constructor(private readonly apiService: ApiService) {}

  getSharedInventory(): Observable<SharedInventoryApiObj[]> {
    return this.sharedInventory$;
  }

  private createSharedInventory(): Observable<SharedInventoryApiObj[]> {
    return this.apiService.authenticatedFetch<SharedInventoryApiObj[]>(
        INVENTORY_PATH).pipe(
        shareReplay({bufferSize: 1, refCount: false}),
        );
  }
}
