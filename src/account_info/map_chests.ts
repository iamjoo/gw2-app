import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions, MatCheckboxModule} from '@angular/material/checkbox';
import {MatTableModule} from '@angular/material/table';

import {combineLatest, Observable, of as observableOf, pipe} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

import {ApiService} from '../api/api';

type MapChestName = 'Verdant Brink'|'Auric Basin'|'Tangled Depths'|
    'Dragon\'s Stand';

interface MapChestReward {
  readonly name: 'Amalgamated Gemstone'|'Reclaimed Metal Plate';
  readonly url: string;
}

interface DataSourceObject {
  readonly completed: boolean;
  readonly name: MapChestName;
  readonly rewards: MapChestReward[];
}

const AMALGAMATED_GEMSTONE: MapChestReward = {
  name: 'Amalgamated Gemstone',
  url: 'https://render.guildwars2.com/file/35BC2D35511C806348730A5E63152B2E260D4A5C/919363.png',
};

const RECLAIMED_METAL_PLATE: MapChestReward = {
  name: 'Reclaimed Metal Plate',
  url: 'https://render.guildwars2.com/file/AC2729C25DE5C2A3E925083570C2161F52280163/1203052.png',
};

function createMapChestDataSourceObject(id: string, apiData: string[]) {
  let name: MapChestName;
  let rewards: MapChestReward[];
  let completed: boolean;

  switch (id) {
    case 'vb':
      name = 'Verdant Brink';
      rewards = [AMALGAMATED_GEMSTONE, RECLAIMED_METAL_PLATE];
      completed = apiData.includes('verdant_brink_heros_choice_chest');
      break;
    case 'ab':
      name = 'Auric Basin';
      rewards = [AMALGAMATED_GEMSTONE];
      completed = apiData.includes('auric_basin_heros_choice_chest');
      break;
    case 'td':
      name = 'Tangled Depths';
      rewards = [AMALGAMATED_GEMSTONE];
      completed = apiData.includes('tangled_depths_heros_choice_chest');
      break;
    case 'ds':
      name = 'Dragon\'s Stand';
      rewards = [AMALGAMATED_GEMSTONE];
      completed = apiData.includes('dragons_stand_heros_choice_chest');
      break;
    default:
      throw new Error('Invalid map!');
  }

  return {name, rewards, completed};
}

@Component({
  selector: 'gw-map-chests',
  templateUrl: './map_chests.ng.html',
  styleUrls: ['./map_chests.scss'],
  imports: [CommonModule, MatCheckboxModule, MatTableModule],
  providers: [
    {
      provide: MAT_CHECKBOX_DEFAULT_OPTIONS,
      useValue: {clickAction: 'noop'} as MatCheckboxDefaultOptions,
    }
  ],
  standalone: true,
})
export class MapChests {
  readonly data$ = this.createData();
  readonly displayedColumns = ['name', 'reward'];

  constructor(private readonly apiService: ApiService) {}

  private createData(): Observable<DataSourceObject[]> {
    return this.apiService.getMapChestsCompleted().pipe(
        map((chestsCompleted) => {
          return ['vb', 'ab', 'td', 'ds'].map((id) => {
            return createMapChestDataSourceObject(id, chestsCompleted);
          });
        }),
    );
  }
}
