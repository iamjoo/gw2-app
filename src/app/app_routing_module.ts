import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AccountInfo} from '../account_info/account_info';
import {Dailies} from '../dailies/dailies';
import {Worlds} from '../worlds/worlds';

const routes: Routes = [
  {path: 'account-info', component: AccountInfo},
  {path: 'dailies', component: Dailies},
  {path: 'worlds', component: Worlds},
  {path: '', redirectTo: '/worlds', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
