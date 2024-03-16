import {AfterViewInit, ChangeDetectionStrategy, Component, Inject, ViewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatInput, MatInputModule} from '@angular/material/input';

@Component({
  selector: 'gw-api-key-dialog',
  templateUrl: './api_key_dialog.ng.html',
  styleUrls: ['./api_key_dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, MatInputModule],
  standalone: true,
})
export class ApiKeyDialog implements AfterViewInit {
  @ViewChild(MatInput) inputEl!: MatInput;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: {apiKey: string},
    private readonly matDialogRef: MatDialogRef<ApiKeyDialog>
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.inputEl.focus();
    }, 100);
  }

  cancel(): void {
    this.matDialogRef.close();
  }

  isDisabled(): boolean {
    return !this.inputEl?.value;
  }

  removeKey(): void {
    this.matDialogRef.close(null);
  }

  setKey(): void {
    this.matDialogRef.close(this.inputEl.value);
  }
}
