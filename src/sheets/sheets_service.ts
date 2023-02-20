import {Injectable} from '@angular/core';

import {from, Observable} from 'rxjs';

const SPREADSHEET_ID = '1lZU5K4UGlUoxjT9tXELU2dV-m4QjCeZv1D8-dLvIkjE';

@Injectable({
  providedIn: 'root',
})
export class SheetsService {
  getWeeklyClearTimes(): Observable<gapi.client.Response<gapi.client.sheets.ValueRange>> {
    return from(gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Test!A1:AA13',
      }));
  }

  getGoalTimes(): Observable<gapi.client.Response<gapi.client.sheets.ValueRange>> {
    return from(gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Goals!A1:B13',
      }));
  }
}
