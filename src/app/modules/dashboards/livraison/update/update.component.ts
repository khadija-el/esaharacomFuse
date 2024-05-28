import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Subscription, lastValueFrom, take } from 'rxjs';
import { FormGroup, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Client, Livraison } from '../../Models/models';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClientComponent } from '../../client/client.component';
import { livraisonService } from '../../Services/livraison.service';
import { clientService } from '../../Services/client.service';
import { SessionService } from '../../Services/session.service';
import { DetailChildsComponent } from '../detailChilds/detailChilds.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [CommonModule,
            MatFormFieldModule,
            MatButtonModule,
            MatIconModule,
            MatCardModule,
            MatSelectModule,
            DetailChildsComponent,
            ReactiveFormsModule,
            MatTableModule,
            MatPaginatorModule,
            MatDialogModule,
            MatProgressSpinnerModule,
            MatExpansionModule,
            MatDividerModule,
            MatInputModule,
            MatSelectModule,
            MatCheckboxModule
        ],

  templateUrl: './update.component.html',
  styleUrl: './update.component.scss'
})
export class UpdateComponent implements OnInit,OnDestroy {
    subs: Subscription[] = [];

    myForm: UntypedFormGroup;
    form = this.fb.group({  dataSource: this.fb.array([])  });
    o = new Livraison();
    title = 'Livraison Client';
    clients: { id: number; name: string; }[] = [];

    session = inject(SessionService);

    constructor(private fb: UntypedFormBuilder , private route: ActivatedRoute,
                private router: Router, public dialog: MatDialog,public serviceLivraison :livraisonService,public serviceClient : clientService) { }

    async ngOnInit() {
      this.createForm();

    //   this.clients = await lastValueFrom(this.serviceClient.getForSelect());

      // const id = this.route.snapshot.paramMap.get('id');
      this.route.paramMap.pipe(take(1)).subscribe(e => {
        this.o.id = +e.get('id');

        if (this.o.id === 0) return;

        this.serviceLivraison.getById(this.o.id).subscribe(r => {
          Object.assign(this.o, r);

          this.myForm.patchValue(this.o);

          const c = this.clients.find(e => +e.id === +this.o.idclient);

                  this.session.myStorage.setItem('client-selected', JSON.stringify(c));
        })
      });
    }

    clientChange(c) {
      this.session.myStorage.setItem('client-selected', JSON.stringify(c));
  }

    async delete(o: Livraison) {
      const r = await this.serviceLivraison.deleteDialog.openDialog('LivraisonClient').toPromise();
      if (r === 'ok') {
        const sub = this.serviceLivraison.delete(o.id).subscribe(() => {

          this.back();
        });

        this.subs.push(sub);
      }
    }

    back(): void {

      this.router.navigate([this.router.url.substring(0, this.router.url.indexOf('/update'))]);
    }

    submit(o: Livraison): void {
      let sub = null;
    //   o.childs = this.o.childs;
      o.montantHt = this.o.montantHt;
      o.montantTTC = this.o.montantTTC;

      Object.assign(this.o, o);

      if (o.id === 0) {

        sub = this.serviceLivraison.post(o).subscribe(r => {
          this.serviceLivraison.snackAdd();
          this.o.id = r.id;
          this.createForm();
          this.router.navigate([this.router.url.replace(this.route.snapshot.paramMap.get('id'), r.id.toString())]);
        });
      } else {
        sub = this.serviceLivraison.put(o.id, o).subscribe(r => {
          this.serviceLivraison.snackUpdate();
        });
      }

      this.subs.push(sub);
    }

    add() {

      this.openDialog({ id: 0 }, 'Ajouter Client').subscribe((result: Client) => {
        if (result) {

          console.log(result);
          this.clients.push({ id: result.id, name: result.name });

          this.clients.sort((a, b) => a.id - b.id);

          this.myForm.get('idClient').setValue(result.id);
        }
      });
    }

    openDialog(o: any, text) {
      const dialogRef = this.dialog.open(ClientComponent, {
        width: '1100px',
        disableClose: false,
        data: { model: o, title: text }
      });

      return dialogRef.afterClosed();
    }

    get isInvalid() {
      return false
      || this.myForm.invalid

    }

    createForm() {
      this.myForm = this.fb.group({
        id: [this.o.id],
        numero: [this.o.numero, []],
        dateCreation: [this.o.date, []],
        montantHT: [this.o.montantHt, []],
        tva: [this.o.tva, []],
        montantTTC: [this.o.montantTTC, []],
        idClient: [this.o.idclient, [Validators.required, Validators.min(1),]],
      });
    }

    ngOnDestroy(): void {
      this.subs.forEach(e => {
        e.unsubscribe();
      });
    }
  }
