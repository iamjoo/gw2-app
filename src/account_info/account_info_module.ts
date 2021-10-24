import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';

import {AccountInfo} from './account_info';
import {InventoryModule} from '../inventory/inventory_module';
import {Wallet} from './wallet';

@NgModule({
  declarations: [
    AccountInfo,
    Wallet,
  ],
  imports: [
    CommonModule,
    InventoryModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatTooltipModule,
  ],
  exports: [AccountInfo],
})
export class AccountInfoModule {}
