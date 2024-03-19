import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {EMPTY, Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {ApiKeyService} from '../api_key/api_key';

const ROOT_URL = 'https://api.guildwars2.com/v2/';

@Injectable({providedIn: 'root'})
export class ApiService {

  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly http: HttpClient
  ) {}

  authenticatedFetch<T>(path: string, requestParams = {}): Observable<T> {
    return this.apiKeyService.apiKey$.pipe(
      switchMap((apiKey) => {
        if (apiKey == null) {
          return EMPTY;
        }

        const params = {...requestParams, access_token: apiKey};
        return this.http.get<T>(`${ROOT_URL}${path}`, {params});
      }),
    );
  }

  nonAuthenticatedFetch<T>(path: string, params = {}): Observable<T> {
    return this.http.get<T>(`${ROOT_URL}${path}`, params);
  }
}
