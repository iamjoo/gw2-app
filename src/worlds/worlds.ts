import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTableModule} from '@angular/material/table';

import {combineLatest, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {AccountService} from '../api/account_service';
import {WorldApiObj, WorldPopulationApi, WorldService} from '../api/world_service';

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
  ],
  standalone: true,
})
export class Worlds {

  readonly data$ = this.createData();
  readonly displayedColumns = ['name', 'population'];

  constructor(
      private readonly accountService: AccountService,
      private readonly worldService: WorldService,
  ) {
    this.worldService.getWvwMatchups().subscribe(a => console.log(a));
  }

  private createData(): Observable<DataSourceObject[]> {
    return combineLatest([
        this.worldService.getWorlds(),
        this.accountService.getAccount().pipe(startWith({world: ''})),
    ]).pipe(
        map(([worlds, {world: homeId}]) => {
          return worlds.map(
              ({id, name, population}) => {
                return {
                  barValue: getBarValue(population),
                  isHome: id === homeId,
                  name,
                  population: convertWorldPopulationApi(population),
                };
              }).sort((a, b) => worldNameComparatorFn(a.name, b.name));
        }),
    );
  }
}
