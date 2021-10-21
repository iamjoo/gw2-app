import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';

import {ApiKeyDialog} from './api_key_dialog';

@NgModule({
  declarations: [ApiKeyDialog],
  imports: [MatButtonModule, MatDialogModule, MatInputModule],
})
export class ApiKeyDialogModule {}
