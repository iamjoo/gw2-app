import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import {Currency} from './currency';
import {Inventory} from './inventory';
import {ItemPrice} from './item_price';

@NgModule({
  declarations: [
    Currency,
    Inventory,
    ItemPrice,
  ],
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    ReactiveFormsModule,
  ],
  exports: [Inventory]
})
export class InventoryModule {}
