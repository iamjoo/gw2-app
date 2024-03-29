import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTableModule} from '@angular/material/table';

import {combineLatest, Observable} from 'rxjs';
import {map, shareReplay, startWith} from 'rxjs/operators';

import {AccountService} from '../api/account_service';
import {EU_ID_PREFIX, NA_ID_PREFIX, Region, WorldApiObj, WorldPopulationApiString, WorldService} from '../api/world_service';
import {WorldPopulationTable, WorldPopulationDataSourceObject} from './world_population_table';

type WorldPopulationString = 'Low'|'Medium'|'High'|'Very High'|'Full';

function convertWorldPopulationApi(population: WorldPopulationApiString):
    WorldPopulationString {
  if (population === 'VeryHigh') {
    return 'Very High'
  }
  return population;
}

function getBarValue(population: WorldPopulationApiString): number {
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

function worldNameComparatorFn(a: string, b: string): number {
  const aIsNorthAm = !a.includes('[');
  const bIsNorthAm = !b.includes('[');

  if (aIsNorthAm && bIsNorthAm) {
    return a.localeCompare(b);
  }

  if (aIsNorthAm) {
    return -1;
  }

  if (bIsNorthAm) {
    return 1;
  }

  const [aName, aServer] = a.split('[');
  const [bName, bServer] = b.split('[');
  const aCountry = aServer.substring(0, 2);
  const bCountry = bServer.substring(0, 2);

  if (aCountry === bCountry) {
    return aName.localeCompare(bName);
  }

  return aCountry.localeCompare(bCountry);
}

@Component({
  selector: 'gw-worlds',
  templateUrl: './worlds.ng.html',
  styleUrls: ['./worlds.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    WorldPopulationTable,
  ],
  standalone: true,
})
export class Worlds {

  private readonly worldsAndHomeId$ = this.createWorldsAndHomeId();
  readonly euWorlds$ = this.createEuWorlds();
  readonly naWorlds$ = this.createNaWorlds();

  constructor(
      private readonly accountService: AccountService,
      private readonly worldService: WorldService,
  ) {}

  private createWorldsAndHomeId(): Observable<[WorldApiObj[], number]> {
    return combineLatest([
        this.worldService.getWorlds(),
        this.accountService.getAccount().pipe(
            startWith({world: 0}),
            map(({world}) => world),
        ),
    ]).pipe(shareReplay({bufferSize: 1, refCount: true}));
  }

  private createEuWorlds(): Observable<WorldPopulationDataSourceObject[]> {
    return this.createWorldsForRegion('eu');
  }

  private createNaWorlds(): Observable<WorldPopulationDataSourceObject[]> {
    return this.createWorldsForRegion('na');
  }

  private createWorldsForRegion(region: Region): Observable<WorldPopulationDataSourceObject[]> {
    const idPrefix = region === 'na' ? NA_ID_PREFIX : EU_ID_PREFIX;

    return this.worldsAndHomeId$.pipe(
        map(([worlds, homeId]) => {
          return worlds
              .filter(({id}) => `${id}`.substring(0, 1) === idPrefix)
              .map(
                  ({id, name, population}) => {
                    return {
                      barValue: getBarValue(population),
                      isHome: id === homeId,
                      name,
                      population: convertWorldPopulationApi(population),
                    };
                  })
              .sort((a, b) => worldNameComparatorFn(a.name, b.name));
        }),
    );
  }
}
