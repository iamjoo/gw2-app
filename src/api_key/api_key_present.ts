import {InjectionToken, inject} from '@angular/core';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ApiKeyService} from './api_key';

export const API_KEY_PRESENT_OBS = new InjectionToken<Observable<boolean>>(
    'API key present',
    {
      factory() {
        return inject(ApiKeyService).apiKey$.pipe(
            map(apiKey => apiKey != null));
    }
});
