import { Livraison } from './../../../core/Models/models';
import { Component, Signal, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateComponent } from './update/update.component';
import { Subject, catchError, delay, delayWhen, filter, map, merge, startWith, switchMap, tap } from 'rxjs';
import { UowService } from 'app/core/services/uow.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { FuseAlertComponent } from '@fuse/components/alert';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';


@Component({
    selector: 'app-livraison',
    standalone: true,
    imports: [CommonModule,
        FuseAlertComponent,
        MatPaginatorModule,
        FormsModule,
        ReactiveFormsModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterLink,
        MatDatepickerModule,
    ],
    templateUrl: './livraison.component.html',

})
export class LivraisonComponent {

    //readonly dialog = inject(MatDialog);
    readonly uow = inject(UowService);
    @ViewChild(MatPaginator, { static: true })
    readonly paginator: MatPaginator;
    @ViewChild(MatSort, { static: true })
    readonly sort: MatSort;

    isLoading: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    readonly showMessage$ = new Subject<any>();

    readonly update = new Subject<number>();
    readonly numero = new FormControl(0);
    readonly dateDebut = new FormControl(null);
    readonly dateFin = new FormControl(null);
    readonly montantTTC = new FormControl(0);
    readonly client = new FormControl(0);
    //
    public isLoadingResults = true;
    public totalRecords = 0;
    //
    readonly router = inject(Router);
    //
    clients = this.uow.clients.getForSelect();
    //
    readonly delete$ = new Subject<Livraison>();
    readonly #delete$ = this.delete$.pipe(
        switchMap(item => this.uow.fuseConfirmation.open().afterClosed().pipe(
            filter((e: 'confirmed' | 'cancelled') => e === 'confirmed'),
            tap(e => console.warn(e)),
            switchMap(_ => this.uow.livraisons.delete(item.id).pipe(
                catchError(this.uow.handleError),
                map((e: any) => ({ code: e?.code < 0 ? -1 : 1, message: e?.code < 0 ? e.message : 'Enregistrement réussi' })),
                tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
            )),
        )),
    );
    //
    readonly viewInitDone = new Subject<void>();
    readonly dataSource: Signal<(Livraison)[]> = toSignal(this.viewInitDone.pipe(
        delay(50),
        switchMap(_ => merge(
            this.sort.sortChange,
            this.paginator.page,
            this.update,
            this.#delete$,
        )),
        startWith(null as any),
        map(_ => ({
            startIndex: (this.paginator?.pageIndex || 0) * (this.paginator?.pageSize ?? 10),// startIndex
            pageSize: this.paginator?.pageSize ?? 10,
            numero: this.numero.value,
            // dateDebut: this.dateDebut.value,
            // dateFin: this.dateFin.value,
            montantTTC: this.montantTTC.value,
            idclient: this.client.value,
        })),
        tap(e => this.isLoadingResults = true),
        switchMap(e => this.uow.livraisons.getListQ(e).pipe(
            tap(),
            map(e => e.list))
        ),
        tap(e => this.isLoadingResults = false),
    ), { initialValue: [] }) as any;

    ngAfterViewInit(): void {
        this.viewInitDone.next();
    }
    panelOpenState = false;

    add() {
        this.router.navigate(['/admin/livraison', 0]);
    }

    edit(o: Livraison) {
        this.router.navigate(['/admin/livraison', o.id]);
    }
    search() {
        this.update.next(0);
    }
    remove(o: Livraison) {
        this.delete$.next(o);
    }

    reset() {
        this.numero.setValue(0);
        this.dateDebut.setValue(null);
        this.dateFin.setValue(null);
        this.client.setValue(0);
        this.montantTTC.setValue(0);
        this.update.next(0);
    }

}
