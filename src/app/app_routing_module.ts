import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AccountInfo} from '../account_info/account_info';
import {Characters} from '../characters/characters';
import {Dailies} from '../dailies/dailies';
import {Inventory} from '../inventory/inventory';
import {Worlds} from '../worlds/worlds';

const routes: Routes = [
  {path: 'account-info', component: AccountInfo},
  {path: 'characters', component: Characters},
  {path: 'inventory', component: Inventory},
  {path: 'dailies', component: Dailies},
  {path: 'worlds', component: Worlds},
  {path: '', redirectTo: '/dailies', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
