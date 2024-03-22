import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AccountInfo} from '../account_info/account_info';
import {Characters} from '../characters/characters';
import {Inventory} from '../inventory/inventory';
import {RaidTimes} from '../raid_times/raid_times';
import {WizardsVault} from '../wizards_vault/wizards_vault';
import {Worlds} from '../worlds/worlds';
import {WvwMatches} from '../wvw_matches/wvw_matches';

const routes: Routes = [
  {path: 'account-info', component: AccountInfo},
  {path: 'characters', component: Characters},
  {path: 'inventory', component: Inventory},
  {path: 'wizards-vault', component: WizardsVault},
  {path: 'raid-times', component: RaidTimes},
  {path: 'worlds', component: Worlds},
  {path: 'wvw-matches', component: WvwMatches},
  {path: '', redirectTo: '/account-info', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
