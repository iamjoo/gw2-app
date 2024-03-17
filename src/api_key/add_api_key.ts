import {CommonModule} from '@angular/common';
import {Component, Inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';

import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {ApiKeyService} from '../api_key/api_key';

@Component({
  selector: 'gw-add-api-key',
  templateUrl: './add_api_key.ng.html',
  styleUrls: ['./add_api_key.scss'],
  imports: [CommonModule, MatButtonModule],
  standalone: true,
})
export class AddApiKey {

  constructor(private readonly apiKeyService: ApiKeyService) {}

  setApiKey(): void {
    this.apiKeyService.setApiKey();
  }
}
