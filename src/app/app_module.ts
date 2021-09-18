import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app_routing_module';
import {App} from './app';

import {AccountInfoModule} from '../account_info/account_info_module';
import {DailiesModule} from '../dailies/dailies_module';
import {WorldsModule} from '../worlds/worlds_module';

@NgModule({
  declarations: [App],
  imports: [
    AccountInfoModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    DailiesModule,
    HttpClientModule,
    MatTabsModule,
    MatToolbarModule,
    WorldsModule,
  ],
  providers: [],
  bootstrap: [App],
})
export class AppModule {}
