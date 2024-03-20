import {Component} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';

import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';

import {ApiKeyService} from '../api_key/api_key';

@Component({
  selector: 'app-root',
  templateUrl: './app.ng.html',
  styleUrls: ['./app.scss'],
})
export class App {

  readonly activeRoute$ = this.createActiveRoute();

  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly router: Router
  ) {}

  setApiKey(): void {
    this.apiKeyService.setApiKey();
  }

  private createActiveRoute(): Observable<string> {
    return this.router.events.pipe(
      filter((event): event is NavigationEnd => {
        return event instanceof NavigationEnd;
      }),
      map(event => event.urlAfterRedirects.replace('/', ''))
    );
  }
}
