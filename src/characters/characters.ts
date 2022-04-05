import {Component, QueryList, ViewChildren} from '@angular/core';

import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

import {EquipmentExpander} from './equipment_expander';
import {ApiService} from '../api/api';
import {BagApiObj, CraftingApiObj, DisciplineApiObj, EquipmentApiObj, GenderApiObj, ProfessionApiObj, RaceApiObj} from '../api/models';
import {ApiKeyService} from '../api_key/api_key';
import {dateStringToMediumDate, secondsToDuration} from '../util/dates';

interface BagInfo {
  readonly name: string;
  readonly capacity: number;
}

interface CraftingInfo {
  readonly info: CraftingApiObj;
  readonly icon: string;
}

interface DataSourceObject {
  readonly age: string;
  readonly bags: BagInfo[];
  readonly crafting: CraftingInfo[];
  readonly created: string;
  readonly deaths: string;
  readonly equipment: EquipmentApiObj[];
  readonly gender: GenderApiObj;
  readonly level: number;
  readonly name: string;
  readonly profession: ProfessionApiObj;
  readonly professionIcon: string;
  readonly race: RaceApiObj;
  readonly title: Observable<string>;
}

function getCraftingIconUrl(
    discipline: DisciplineApiObj, filesMap: Map<string, string>): string {
  const prefix = 'map_crafting_';
  const suffix = discipline === 'Chef' ? 'cook' : discipline.toLowerCase();

  return filesMap.get(`${prefix}${suffix}`) ?? '';
}

function getProfessionIconUrl(
    profession: ProfessionApiObj, filesMap: Map<string, string>): string {
  const prefix = 'icon_';
  const suffix = profession.toLowerCase();

  return filesMap.get(`${prefix}${suffix}`) ?? '';
}

@Component({
  selector: 'gw-characters',
  templateUrl: './characters.ng.html',
  styleUrls: ['./characters.scss'],
})
export class Characters {

  readonly data$ = this.createData();
  readonly displayedColumns = [
      'name',
      'level',
      'profession',
      'crafting',
      'race',
      'gender',
      'age',
      'created',
      'deaths',
      'bags',
      'equipment',
  ];
  readonly needsKey$ = this.createNeedsKey();

  @ViewChildren(EquipmentExpander) expanders!: QueryList<EquipmentExpander>;

  constructor(
      private readonly apiKeyService: ApiKeyService,
      private readonly apiService: ApiService,
  ) {}

  collapseAll(): void {
    this.expanders.forEach((expander) => expander.close());
  }

  expandAll(): void {
    this.expanders.forEach((expander) => expander.open());
  }

  setApiKey(): void {
    this.apiKeyService.setApiKey();
  }

  private createData(): Observable<DataSourceObject[]> {
    // each `character`` has an array of `equipment`
    // each `equipment` has an item id
    // each item has name, description, infix_upgrade, etc.
    return combineLatest([
        this.apiService.getCharacters(),
        this.apiService.getFilesMap(),
    ]).pipe(
        tap(([a]) => console.log(a)),
        map(([characters, filesMap]) => {
          return characters.map((character) => {
            return {
              age: secondsToDuration(character.age),
              bags: getBagsInfo(character.bags),
              crafting: getCraftingInfo(character.crafting, filesMap),
              created: dateStringToMediumDate(character.created),
              deaths: character.deaths.toLocaleString(),
              equipment: character.equipment,
              gender: character.gender,
              level: character.level,
              name: character.name,
              profession: character.profession,
              professionIcon:
                  getProfessionIconUrl(character.profession, filesMap),
              race: character.race,
              title: this.getTitle(character.title),
            };
          });
        }),
    );
  }

  private createNeedsKey(): Observable<boolean> {
    return this.apiKeyService.apiKey$.pipe(
        map((apiKey) => apiKey === null),
    );
  }

  private getTitle(id: number|undefined): Observable<string> {
    if (id == null) {
      return observableOf('');
    }

    return this.apiService.getTitle(id).pipe(
        map((title) => title.name),
    );
  }
}

function getBagsInfo(bagObjects: BagApiObj[]): BagInfo[] {
  return bagObjects.map((bagObj, index) => {
    return {name: `Bag ${index + 1}`, capacity: bagObj.size};
  });
}

function getCraftingInfo(
    craftingArray: CraftingApiObj[], filesMap: Map<string, string>):
    CraftingInfo[] {
  return craftingArray.map((craftingObj) => {
    return {
      info: craftingObj,
      icon: getCraftingIconUrl(craftingObj.discipline, filesMap),
    }
  });
}
