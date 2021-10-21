import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app_routing_module';
import {App} from './app';

import {AccountInfoModule} from '../account_info/account_info_module';
import {ApiKeyDialogModule} from '../api_key/api_key_dialog_module';
import {CharactersModule} from '../characters/characters_module';
import {DailiesModule} from '../dailies/dailies_module';
import {InventoryModule} from '../inventory/inventory_module';
import {WorldsModule} from '../worlds/worlds_module';

@NgModule({
  declarations: [App],
  imports: [
    AccountInfoModule,
    ApiKeyDialogModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CharactersModule,
    DailiesModule,
    HttpClientModule,
    InventoryModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,
    MatToolbarModule,
    WorldsModule,
  ],
  providers: [],
  bootstrap: [App],
})
export class AppModule {}
