import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';

export interface WizardsVaultDataSourceObject {
  readonly name: string;
  readonly acclaim: number;
  readonly current: number;
  readonly total: number;
  readonly progress: number;
}

@Component({
  selector: 'gw-wizards-vault-table',
  templateUrl: './wizards_vault_table.ng.html',
  styleUrls: ['./wizards_vault_table.scss'],
  imports: [CommonModule, MatIconModule, MatProgressBarModule, MatTableModule],
  standalone: true,
})
export class WizardsVaultTable {

  @Input({required: true}) dataSource!: WizardsVaultDataSourceObject[];

  readonly displayedColumns = ['name', 'acclaim'];
}
