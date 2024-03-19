import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

import {ApiService} from './api';

interface FileApiObj {
  readonly id: string;
  readonly icon: string;
}

const FILES_PATH = 'files';

@Injectable({providedIn: 'root'})
export class FilesService {

  private readonly files$ = this.createFilesMap();

  constructor(private readonly apiService: ApiService) {}

  getFilesMap(): Observable<Map<string, string>> {
    return this.files$;
  }

  private createFilesMap(): Observable<Map<string, string>> {
    const params = {ids: 'all'};

    return this.apiService
      .nonAuthenticatedFetch<FileApiObj[]>(FILES_PATH, {params})
      .pipe(
        map((files) => {
          const fileMap = new Map<string, string>();
          for (const file of files) {
            fileMap.set(file.id, file.icon);
          }

          return fileMap;
        }),
        shareReplay({bufferSize: 1, refCount: false}));
  }
}
