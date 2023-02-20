import {AfterViewInit, ChangeDetectionStrategy, Component, Inject, QueryList, ViewChildren} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatInput, MatInputModule} from '@angular/material/input';

interface DialogData {
  readonly apiKey: string;
  readonly clientId: string;
}

@Component({
  selector: 'gw-google-api-key-dialog',
  templateUrl: './google_api_key_dialog.ng.html',
  styleUrls: ['./google_api_key_dialog.scss'],
  imports: [MatButtonModule, MatDialogModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class GoogleApiKeyDialog implements AfterViewInit {
  @ViewChildren(MatInput) inputEls!: QueryList<MatInput>;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: DialogData,
    private readonly matDialogRef: MatDialogRef<GoogleApiKeyDialog>
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.inputEls.get(0)?.focus();
    }, 100);
  }

  cancel(): void {
    this.matDialogRef.close();
  }

  isDisabled(): boolean {
    return !this.inputEls?.get(0)?.value || !this.inputEls?.get(1)?.value;
  }

  removeKeys(): void {
    this.matDialogRef.close(null);
  }

  setKeys(): void {
    const apiKey = this.inputEls.get(0)?.value ?? '';
    const clientId = this.inputEls.get(1)?.value ?? '';
    this.matDialogRef.close({apiKey, clientId});
  }
}
