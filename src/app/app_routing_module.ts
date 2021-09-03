import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AccountInfo} from '../account_info/account_info';
import {Build} from '../build/build';
import {Dailies} from '../dailies/dailies';
import {Worlds} from '../worlds/worlds';

const routes: Routes = [
  {path: 'account-info', component: AccountInfo},
  {path: 'build', component: Build},
  {path: 'dailies', component: Dailies},
  {path: 'worlds', component: Worlds},
  {path: '', redirectTo: '/build', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
