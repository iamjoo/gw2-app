import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

interface MaterialApiObj {
  readonly id: number;
  readonly count: number;
}

const MATERIALS_PATH = 'account/materials';

@Injectable({providedIn: 'root'})
export class MaterialsService {

  private readonly materials$ = this.createMaterials();

  constructor(private readonly apiService: ApiService) {}

  getMaterials(): Observable<MaterialApiObj[]> {
    return this.materials$;
  }

  private createMaterials(): Observable<MaterialApiObj[]> {
    return this.apiService.authenticatedFetch<MaterialApiObj[]>(
        MATERIALS_PATH).pipe(
        shareReplay({bufferSize: 1, refCount: false}),
        );
  }
}
