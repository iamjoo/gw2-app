import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

import {ItemApiObj, ItemRarity} from '../api/models';

@Component({
  selector: 'gw-armor-weapon-info',
  templateUrl: './armor_weapon_info.ng.html',
  styleUrls: ['./armor_weapon_info.scss'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ArmorWeaponInfo {

  @Input() item: ItemApiObj|null = null;

  getClass(): string {
    return this.item?.rarity.toLowerCase() ?? '';
  }
}
