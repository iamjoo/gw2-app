import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

const MAP_CHESTS_PATH = 'account/mapchests';

@Injectable({providedIn: 'root'})
export class MapChestsService {

  private readonly mapChestsCompleted$ = this.createMapChestsCompleted();

  constructor(private readonly apiService: ApiService) {}

  getMapChestsCompleted(): Observable<string[]> {
    return this.mapChestsCompleted$;
  }

  private createMapChestsCompleted(): Observable<string[]> {
    return this.apiService.authenticatedFetch<string[]>(
        MAP_CHESTS_PATH).pipe(
        shareReplay({bufferSize: 1, refCount: false}),
        );
  }
}
