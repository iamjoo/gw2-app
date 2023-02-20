import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AccountInfo} from '../account_info/account_info';
import {Characters} from '../characters/characters';
import {Dailies} from '../dailies/dailies';
import {Inventory} from '../inventory/inventory';
import {RaidTimes} from '../raid_times/raid_times';
import {Worlds} from '../worlds/worlds';

const routes: Routes = [
  {path: 'account-info', component: AccountInfo},
  {path: 'characters', component: Characters},
  {path: 'inventory', component: Inventory},
  {path: 'dailies', component: Dailies},
  {path: 'raid-times', component: RaidTimes},
  {path: 'worlds', component: Worlds},
  {path: '', redirectTo: '/dailies', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
