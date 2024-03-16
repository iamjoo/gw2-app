import {CommonModule} from '@angular/common';
import {Component, Input, ViewChild} from '@angular/core';
import {MatBadgeModule} from '@angular/material/badge';
import {MatExpansionModule, MatExpansionPanel} from '@angular/material/expansion';

import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ArmorWeaponInfo} from './armor_weapon_info';
import {EquipmentApiObj, ItemApiObj} from '../api/models';
import {ItemService} from '../item/item_service';

interface Equipment {
  accessory1?: ItemApiObj;
  accessory2?: ItemApiObj;
  amulet?: ItemApiObj;
  axe?: ItemApiObj;
  backpack?: ItemApiObj;
  boots?: ItemApiObj;
  coat?: ItemApiObj;
  gloves?: ItemApiObj;
  helm?: ItemApiObj;
  helmAquatic?: ItemApiObj;
  leggings?: ItemApiObj;
  pick?: ItemApiObj;
  ring1?: ItemApiObj;
  ring2?: ItemApiObj;
  shoulders?: ItemApiObj;
  sickle?: ItemApiObj;
  weaponA1?: ItemApiObj;
  weaponA2?: ItemApiObj;
  weaponAquaticA?: ItemApiObj;
  weaponAquaticB?: ItemApiObj;
  weaponB1?: ItemApiObj;
  weaponB2?: ItemApiObj;
}

@Component({
  selector: 'gw-equipment-expander',
  templateUrl: './equipment_expander.ng.html',
  styleUrls: ['./equipment_expander.scss'],
  imports: [ArmorWeaponInfo, CommonModule, MatBadgeModule, MatExpansionModule],
  standalone: true,
})
export class EquipmentExpander {

  @Input() equipments: EquipmentApiObj[] = [];

  @ViewChild(MatExpansionPanel) expander!: MatExpansionPanel;

  readonly equipment$ = this.createEquipment();
  isClosed = true;

  constructor(private readonly itemService: ItemService) {}

  close(): void {
    this.expander.close();
  }

  open(): void {
    this.expander.open();
  }

  private createEquipment(): Observable<Equipment> {
    return this.itemService.getAllCharacterItemIdsToItems().pipe(
        map((itemIdsToItems) => {
          const equipment: Equipment = {};

          for (const equipmentApiObj of this.equipments) {
            const item = itemIdsToItems.get(equipmentApiObj.id);
            if (!item) {
              console.warn(`Missing item ID: [${equipmentApiObj.id}]`);
              continue;
            }

            switch (equipmentApiObj.slot) {
              case 'Accessory1':
                equipment.accessory1 = item;
                break;
              case 'Accessory2':
                equipment.accessory2 = item;
                break;
              case 'Amulet':
                equipment.amulet = item;
                break;
              case 'Axe':
                equipment.axe = item;
                break;
              case 'Backpack':
                equipment.backpack = item;
                break;
              case 'Boots':
                equipment.boots = item;
                break;
              case 'Coat':
                equipment.coat = item;
                break;
              case 'Gloves':
                equipment.gloves = item;
                break;
              case 'Helm':
                equipment.helm = item;
                break;
              case 'HelmAquatic':
                equipment.helmAquatic = item;
                break;
              case 'Leggings':
                equipment.leggings = item;
                break;
              case 'Pick':
                equipment.pick = item;
                break;
              case 'Ring1':
                equipment.ring1 = item;
                break;
              case 'Ring2':
                equipment.ring2 = item;
                break;
              case 'Shoulders':
                equipment.shoulders = item;
                break;
              case 'Sickle':
                equipment.sickle = item;
                break;
              case 'WeaponA1':
                equipment.weaponA1 = item;
                break;
              case 'WeaponA2':
                equipment.weaponA2 = item;
                break;
              case 'WeaponAquaticA':
                equipment.weaponAquaticA = item;
                break;
              case 'WeaponAquaticB':
                equipment.weaponAquaticB = item;
                break;
              case 'WeaponB1':
                equipment.weaponB1 = item;
                break;
              case 'WeaponB2':
                equipment.weaponB2 = item;
            }
          }

          return equipment;
        }),
    );
  }
}
