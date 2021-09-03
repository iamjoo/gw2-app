import {Component} from '@angular/core';

import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ApiService} from '../api/api';
import {WorldApiObj, WorldPopulationApi} from '../api/models';

type WorldPopulation = 'Low'|'Medium'|'High'|'Very High'|'Full';

interface DataSourceObject {
  readonly barValue: number;
  readonly isHome: boolean;
  readonly name: string;
  readonly population: WorldPopulation;
}

function convertWorldPopulationApi(population: WorldPopulationApi):
    WorldPopulation {
  if (population === 'VeryHigh') {
    return 'Very High'
  }
  return population;
}

function getBarValue(population: WorldPopulationApi): number {
  switch (population) {
    case 'Low':
      return 20;
    case 'Medium':
      return 40;
    case 'High':
      return 60;
    case 'VeryHigh':
      return 80;
    case 'Full':
      return 100;
    default:
      return 0;
  }
}

@Component({
  selector: 'gw-worlds',
  templateUrl: './worlds.ng.html',
  styleUrls: ['./worlds.scss']
})
export class Worlds {

  readonly data$ = this.createData();
  readonly displayedColumns = ['name', 'population'];

  constructor(private readonly apiService: ApiService) {}

  private createData(): Observable<DataSourceObject[]> {
    return combineLatest([
        this.apiService.getWorlds(),
        this.apiService.getAccount(),
    ]).pipe(
        map(([worlds, {world: homeId}]) => worlds.map(
            ({id, name, population}) => {
              return {
                barValue: getBarValue(population),
                isHome: id === homeId,
                name,
                population: convertWorldPopulationApi(population),
              };
            })),
    );
  }
}
