import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

export type WorldPopulationApi =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'VeryHigh'
  | 'Full';

export interface WorldApiObj {
  readonly id: number;
  readonly name: string;
  readonly population: WorldPopulationApi;
}

const WORLDS_PATH = 'worlds';

@Injectable({providedIn: 'root'})
export class WorldService {

  private readonly worlds$ = this.createWorlds();

  constructor(private readonly apiService: ApiService) {}

  getWorlds(): Observable<WorldApiObj[]> {
    return this.worlds$;
  }

  private createWorlds(): Observable<WorldApiObj[]> {
    const params = {ids: 'all'};

    return this.apiService
      .nonAuthenticatedFetch<WorldApiObj[]>(WORLDS_PATH, {params})
      .pipe(shareReplay({bufferSize: 1, refCount: false}));
  }
}
