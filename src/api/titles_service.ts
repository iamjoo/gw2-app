import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';

import {ApiService} from './api';

interface TitleApiObj {
  readonly id: number;
  readonly name: string;
}

const TITLES_PATH = 'titles';

@Injectable({providedIn: 'root'})
export class TitlesService {

  constructor(private readonly apiService: ApiService) {}

  getTitle(id: number): Observable<TitleApiObj> {
    const path = `${TITLES_PATH}/${id}`;
    return this.apiService.nonAuthenticatedFetch<TitleApiObj>(path);
  }
}
