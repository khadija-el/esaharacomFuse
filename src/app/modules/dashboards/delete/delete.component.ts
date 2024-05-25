import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete',
  standalone: true,
  imports: [MatDialogClose,MatButtonModule],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})

export class DeleteComponent implements OnInit {
  model = '';
  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.model = this.data.model;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkClick(): void {
    this.dialogRef.close('ok');
  }

}
