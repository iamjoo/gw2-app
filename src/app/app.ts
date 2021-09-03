import {Component} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';

import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';

import {ApiService} from '../api/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.ng.html',
  styleUrls: ['./app.scss']
})
export class App {
  readonly activeRoute$ = this.createActiveRoute();

  constructor(
      private readonly apiService: ApiService,
      private readonly router: Router,
  ) {
  }

  private createActiveRoute(): Observable<string> {
    return this.router.events.pipe(
        filter((event): event is NavigationEnd => {
          return event instanceof NavigationEnd;
        }),
        map((event) => event.urlAfterRedirects.replace('/', '')),
        );
  }
}
