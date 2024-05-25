import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Client } from '../Models/models';
import { FormControl } from '@angular/forms';
import { clientService } from '../Services/client.service';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-client',
  standalone: true,
  imports:  [MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss'
})
export class ClientComponent implements OnInit,OnDestroy {

  update = new Subject<boolean>();

  dataSource: Client[] = [];

  displayedColumns = [
    //  'select',
    'name',
    'tel',
    'adresse',
    'option'
  ];

  panelOpenState = false;

  reference = new FormControl('');
  designation = new FormControl('');

  constructor(private Router: Router, private route: ActivatedRoute, private service: clientService) { }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    const sub = this.service.get().subscribe(
      (r: any) => {
        console.log(r);
        this.dataSource = r;
      }

    );
    console.log("<<<<<<<<<<<<>>>>>>>>>>");

  }

  add() {

    this.Router.navigate(['/client/update', 0]);
    // this.router.navigate(['update', 0], { relativeTo: this.route });
  }

  edit(o: Client) {

    this.Router.navigate(['/client/update', o.id]);
    // this.router.navigate(['update', o.id], { relativeTo: this.route });

  }
 printD(){
window.print();
 }
  async delete(o: Client) {
    const r = await this.service.deleteDialog.openDialog('client').toPromise();
    if (r === 'ok') {
      const sub = this.service.delete(o.id).subscribe(() => this.update.next(true));

      // this.subs.push(sub);
    }
  }

}
