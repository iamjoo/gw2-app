import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

export interface MasteryPointsApiObj {
  readonly totals: MasteryApiObj[];
}

interface MasteryApiObj {
  readonly region: string;
  readonly spent: number;
  readonly earned: number;
}

const MASTERY_POINTS_PATH = 'account/mastery/points';

@Injectable({providedIn: 'root'})
export class MasteryPointsService {
  private readonly masteryPoints$ = this.createMasteryPoints();

  constructor(private readonly apiService: ApiService) {}

  getMasteryPoints(): Observable<MasteryPointsApiObj> {
    return this.masteryPoints$;
  }

  private createMasteryPoints(): Observable<MasteryPointsApiObj> {
    return this.apiService.authenticatedFetch<MasteryPointsApiObj>(
        MASTERY_POINTS_PATH).pipe(
        shareReplay({bufferSize: 1, refCount: false}),
        );
  }
}
