import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

export interface PvpApiObj {
  readonly pvp_rank: number;
}

const PVP_STATS_PATH = 'pvp/stats';

@Injectable({providedIn: 'root'})
export class PvpService {

  private readonly pvpStats$ = this.createPvpStats();

  constructor(private readonly apiService: ApiService) {}

  getPvpStats(): Observable<PvpApiObj> {
    return this.pvpStats$;
  }

  private createPvpStats(): Observable<PvpApiObj> {
    return this.apiService.authenticatedFetch<PvpApiObj>(
        PVP_STATS_PATH).pipe(
        shareReplay({bufferSize: 1, refCount: false}),
        );
  }
}
