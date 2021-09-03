import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

import {Build} from './build';

@NgModule({
  declarations: [Build],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
  ],
  exports: [Build]
})
export class BuildModule {}
