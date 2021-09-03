import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTableModule} from '@angular/material/table';

import {Dailies} from './dailies';

@NgModule({
  declarations: [Dailies],
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatTableModule,
  ],
  exports: [Dailies]
})
export class DailiesModule {}
