import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';

import {Characters} from './characters';
import {EquipmentExpander} from './equipment_expander';

@NgModule({
  declarations: [
    Characters,
    EquipmentExpander,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatTableModule,
    MatTooltipModule,
  ],
  exports: [Characters]
})
export class CharactersModule {}
