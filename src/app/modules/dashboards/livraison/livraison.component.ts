import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { EMPTY, Subject, Subscription, startWith } from 'rxjs';
import { Livraison } from '../Models/models';
import { UntypedFormControl } from '@angular/forms';
import { merge } from 'lodash';
import { livraisonService } from '../Services/livraison.service';
import { ActivatedRoute, Router } from '@angular/router';
import { clientService } from '../Services/client.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'app-livraison',
    standalone: true,
    imports: [CommonModule,
              MatTableModule,
              MatPaginatorModule,
              MatButtonModule,
              MatDialogModule,
              MatIconModule,
              MatCardModule,
              MatFormFieldModule,
              MatCardModule,
              MatProgressSpinnerModule,
              MatExpansionModule,
              MatDividerModule,
              MatInputModule,
              MatSelectModule,
              MatCheckboxModule],
    templateUrl: './livraison.component.html',
    styleUrl: './livraison.component.scss'
})
export class LivraisonComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort?: MatSort;
    update = new Subject<boolean>();

    isLoadingResults = true;
    resultsLength = 0;
    isRateLimitReached = false;

    subs: Subscription[] = [];

    dataSource: Livraison[] = [];
    selectedList: Livraison[] = [];

    displayedColumns = [
        'select',
        'numero',
        'client',
        'date',
        'montantHT',
        'tva',
        'montantTTC',
        'option'
    ];

    panelOpenState = false;

    now = new Date();
    numero = new UntypedFormControl(0);
    dateDebut = new UntypedFormControl(new Date(this.now.getFullYear() - 1, this.now.getMonth() - 1, this.now.getDate()));
    dateFin = new UntypedFormControl(new Date(this.now.getFullYear() + 1, this.now.getMonth(), this.now.getDate()));
    montantTTCMin = new UntypedFormControl(0);
    montantTTCMax = new UntypedFormControl(0);
    clients = this.serviceClient.getForSelect();
    idClient = new UntypedFormControl(0);

    constructor(public service: livraisonService
        , private router: Router, private route: ActivatedRoute, public serviceClient: clientService) { }

    ngOnInit() {

        const sub = merge(this.paginator.page??EMPTY, this.update).pipe(startWith(null as any)).subscribe(
            r => {

                r === true ? this.paginator.pageIndex = 0 : r = r;
                !this.paginator.pageSize ? this.paginator.pageSize = 10 : r = r;
                const startIndex = this.paginator.pageIndex * this.paginator.pageSize;

                this.getPage(
                    startIndex,
                    this.paginator.pageSize,
                    this.numero.value === '' ? '*' : this.numero.value,
                    formatDate(this.dateDebut.value, 'yyyy-MM-dd', 'fr-FR'),
                    formatDate(this.dateFin.value, 'yyyy-MM-dd', 'fr-FR'),
                    this.montantTTCMin.value,
                    this.montantTTCMax.value,
                    this.idClient.value,
                );
            }
        );

        this.subs.push(sub);
    }

    reset() {

        this.numero.setValue('');
        this.dateDebut.setValue(new Date(this.now.getFullYear() - 1, this.now.getMonth() - 1, this.now.getDate()));
        this.dateFin.setValue(new Date(this.now.getFullYear() + 1, this.now.getMonth(), this.now.getDate()));
        this.montantTTCMin.setValue(0);
        this.montantTTCMax.setValue(0);
        this.idClient.setValue(0);

        this.update.next(true);
    }

    search() {
        this.update.next(true);
    }

    getPage(startIndex, pageSize, numero, dateDebut, dateFin, montantTTCMin, montantTTCMax, idClient) {

        this.isLoadingResults = true;

        const sub = this.service.getAll(startIndex, pageSize , numero, dateDebut, dateFin, montantTTCMin, montantTTCMax, idClient).subscribe(
            (r: any) => {

                this.dataSource = r.list;
                this.resultsLength = r.count;
                this.isLoadingResults = false;
                console.log(r)
            }, e => {
                this.isLoadingResults = false;
            }
        );

        this.subs.push(sub);
    }


    add() {
        this.router.navigate(['./update', 0], { relativeTo: this.route });
    }

    edit(o: Livraison) {
        this.router.navigate(['./update', o.id], { relativeTo: this.route });
    }

    async delete(o: Livraison) {
        const r = await this.service.deleteDialog.openDialog('Livraison').toPromise();
        if (r === 'ok') {
            const sub = this.service.delete(o.id).subscribe(() => this.update.next(true));

            this.subs.push(sub);
        }
    }

    imgError(img: any) {
        img.src = 'assets/404.jpg';
    }

    //check box£
    //
    isSelected(row: Livraison): boolean {
        return this.selectedList.find(e => e.id === row.id) ? true : false;
    }

    check(row: Livraison) {
        const i = this.selectedList.findIndex(o => row.id === o.id);
        const existe: boolean = i !== -1;

        existe ? this.selectedList.splice(i, 1) : this.selectedList.push(row);
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): boolean {
        const numSelected = this.selectedList.length;
        const numRows = this.dataSource.length;

        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ? this.selectedList = [] : this.selectedList = Array.from(this.dataSource);
    }

    // async deleteList() {
    //   const r = await this.service.deleteDialog.openDialog('LivraisonClient').toPromise();
    //   if (r === 'ok') {
    //     const sub = this.service.deleteRangeByIds(this.selectedList.map(e => e.id)).subscribe(() => {
    //       this.selectedList = [];
    //       this.update.next(true);
    //     });

    //     this.subs.push(sub);
    //   }
    // }

    ngOnDestroy(): void {
        this.subs.forEach(e => {
            e.unsubscribe();
        });
    }

}
