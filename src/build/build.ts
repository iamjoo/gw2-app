import {Component} from '@angular/core';

import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';

import {ApiService} from '../api/api';

@Component({
  selector: 'gw-build',
  templateUrl: './build.ng.html',
  styleUrls: ['./build.scss']
})
export class Build {
  readonly build$ = this.createBuild();

  constructor(private readonly apiService: ApiService) {}

  private createBuild(): Observable<number> {
    return this.apiService.getBuild().pipe(
        map((build) => build.id),
    );
  }
}
