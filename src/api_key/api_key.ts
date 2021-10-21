import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';

import {BehaviorSubject, Observable} from 'rxjs';

import {ApiKeyDialog} from './api_key_dialog';

const STORAGE_KEY = 'gw2-app-api-key';

function getApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

@Injectable({
  providedIn: 'root',
})
export class ApiKeyService {
  private readonly apiKeyInternal$ = new BehaviorSubject<string | null>(
    getApiKey()
  );
  readonly apiKey$: Observable<string | null> = this.apiKeyInternal$;

  constructor(private readonly matDialog: MatDialog) {}

  setApiKey(): void {
    const currentKey = this.apiKeyInternal$.getValue() ?? '';
    const config = {
      autoFocus: false,
      data: {
        apiKey: currentKey,
      },
      width: '850px',
    };
    const dialogRef = this.matDialog.open(ApiKeyDialog, config);

    dialogRef
      .afterClosed()
      .subscribe((newApiKey: string | null | undefined) => {
        // User clicked cancel
        if (newApiKey === undefined) {
          return;
        }

        if (newApiKey === null) {
          // User clicked remove key
          localStorage.removeItem(STORAGE_KEY);
        } else {
          // should be caught
          localStorage.setItem(STORAGE_KEY, newApiKey);
        }

        this.apiKeyInternal$.next(newApiKey);
      });
  }
}
