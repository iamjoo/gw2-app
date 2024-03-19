import {CommonModule} from '@angular/common';
import {Component, Inject, QueryList, ViewChildren} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTableModule} from '@angular/material/table';

import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {AddApiKey} from '../api_key/add_api_key';
import {API_KEY_PRESENT_OBS} from '../api_key/api_key_present';
import {BagApiObj, CharactersService, CraftingApiObj, DisciplineApiObj, EquipmentApiObj, GenderApiObj, ProfessionApiObj, RaceApiObj} from '../api/characters_service';
import {EquipmentExpander} from './equipment_expander';
import {FilesService} from '../api/files_service';
import {ItemApiObj} from '../api/models';
import {ItemService} from '../item/item_service';
import {TitlesService} from '../api/titles_service';
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
  imports: [
    AddApiKey,
    CommonModule,
    EquipmentExpander,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
  ],
  standalone: true,
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

  @ViewChildren(EquipmentExpander) expanders!: QueryList<EquipmentExpander>;

  constructor(
      @Inject(API_KEY_PRESENT_OBS) readonly apiKeyPresent$: Observable<boolean>,
      private readonly charactersService: CharactersService,
      private readonly filesService: FilesService,
      private readonly itemService: ItemService,
      private readonly titlesService: TitlesService,
  ) {}

  collapseAll(): void {
    this.expanders.forEach((expander) => expander.close());
  }

  expandAll(): void {
    this.expanders.forEach((expander) => expander.open());
  }

  private createData(): Observable<DataSourceObject[]> {
    // each `character`` has an array of `equipment`
    // each `equipment` has an item id
    // each item has name, description, infix_upgrade, etc.
    return combineLatest([
        this.charactersService.getCharacters(),
        this.filesService.getFilesMap(),
        this.itemService.getAllCharacterItemIdsToItems(),
    ]).pipe(
        map(([characters, filesMap, itemIdsToItems]) => {
          return characters.map((character) => {
            return {
              age: secondsToDuration(character.age),
              bags: getBagsInfo(character.bags, itemIdsToItems),
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

  private getTitle(id: number|undefined): Observable<string> {
    if (id == null) {
      return observableOf('');
    }

    return this.titlesService.getTitle(id).pipe(
        map((title) => title.name),
    );
  }
}

function getBagsInfo(
    bagObjects: BagApiObj[],
    itemIdsToItems: Map<number, ItemApiObj>): BagInfo[] {
  return bagObjects.map((bagObj) => {
    const name = itemIdsToItems.get(bagObj.id)?.name ?? 'Bag';
    return {name, capacity: bagObj.size};
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
