import {Component, Input} from '@angular/core';

import {EquipmentApiObj} from '../api/models';

@Component({
  selector: 'gw-equipment-expander',
  templateUrl: './equipment_expander.ng.html',
  styleUrls: ['./equipment_expander.scss']
})
export class EquipmentExpander {

  @Input() expanded = false;
  @Input() equipment: EquipmentApiObj[] = [];

  ngOnInit(): void {
    console.log(this.equipment);
  }
}
