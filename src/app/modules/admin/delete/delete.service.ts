
import { Injectable, Optional, inject } from '@angular/core';
import { DeleteComponent } from './delete.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class DeleteService {
  dialog = inject( MatDialog)

  // constructor (@Optional() public dialog: MatDialog) { }

  openDialog(model: string) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '750px',
      disableClose: true,
      data: { model }
    });

    return dialogRef.afterClosed();
  }
}
