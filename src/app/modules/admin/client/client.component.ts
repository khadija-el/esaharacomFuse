import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Observable, Subject, catchError, switchMap, takeUntil, filter, map, tap, merge, startWith } from 'rxjs';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule, MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { Client } from 'app/core/Models/models';
import { UowService } from 'app/core/services/uow.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSort } from '@angular/material/sort';
import { UpdateComponent } from './update/update.component';

@Component({
    selector: 'app-client',
    standalone: true,
    imports: [MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatExpansionModule,
        MatTableModule,
        MatDialogModule, CommonModule, MatInputModule],

    templateUrl: './client.component.html',
    styleUrl: './client.component.scss'
})
export class ClientComponent implements OnInit, OnDestroy {

    //update = new Subject<boolean>();
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;


    isLoading: boolean = false;
    selectedClient: Client | null = null;
    selectedClientForm: UntypedFormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    readonly uow = inject(UowService);
    readonly showMessage$ = new Subject<any>();
    readonly dialog = inject(MatDialog);
    readonly update = new Subject<number>();
    readonly  delete$ = new Subject<Client>();
    readonly #delete$ = this.delete$.pipe(
        tap(e => console.error('>>>>>>>>')),
        switchMap(item => this.uow.fuseConfirmation.open().afterClosed().pipe(
            filter((e: 'confirmed' | 'cancelled') => e === 'confirmed'),
            tap(e => console.warn(e)),
            switchMap(_ => this.uow.clients.delete(item.id).pipe(
                catchError(this.uow.handleError),
                map((e: any) => ({ code: e?.code < 0 ? -1 : 1, message: e?.code < 0 ? e.message : 'Enregistrement réussi' })),
                tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
            )),
        )),
    );


    dataSource: Client[] = [];
    clients$ = merge(
        this.update,
        this.#delete$,
    ).pipe(
        startWith(null),
        switchMap(_ => this.uow.clients.get())
        // map(list => list),
    )
    //   .subscribe(
    //     (r: any) => {
    //       console.log(r);
    //       this.dataSource = r;
    //       this.clients$=r
    //     }
    //   );
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

    constructor(private Router: Router,
        private route: ActivatedRoute,
        private service: UowService,
        private _formBuilder: UntypedFormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,) { }

    ngOnDestroy(): void {
    }

    ngOnInit(): void {
        // const sub = this.service.clients.get().subscribe(
        //   (r: any) => {
        //     console.log(r);
        //     this.dataSource = r;
        //     this.clients$=r
        //   }

        // );
        // console.log("<<<<<<<<<<<<>>>>>>>>>>");
        this.selectedClientForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            tel: [''],
            adresse: [''],
            images: [[]],

        });

    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: 'name',
                start: 'asc',
                disableClear: true,
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();

            // If the user changes the sort order...
            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    // Reset back to the first page
                    this._paginator.pageIndex = 0;

                    // Close the details
                    this.closeDetails();
                });

            // Get products if sort or page changes
            //   merge(this._sort.sortChange, this._paginator.page).pipe(
            //       switchMap(() =>
            //       {
            //           this.closeDetails();
            //           this.isLoading = true;
            //           return this.clients$.getProducts(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
            //       }),
            //       map(() =>
            //       {
            //           this.isLoading = false;
            //       }),
            //   ).subscribe();
        }
    }

    closeDetails(): void {
        this.selectedClient = null;
    }

    openDialog(o: Client, text) {
        const dialogRef = this.dialog.open(UpdateComponent, {
            // width: '1100px',
            disableClose: true,
            data: { model: o, title: text }
        });

        return dialogRef.afterClosed();
    };
    add() {

        //this.Router.navigate(['/client/update', 0]);
        // this.router.navigate(['update', 0], { relativeTo: this.route });
        this.openDialog({} as Client, 'Ajouter Client').subscribe(result => {
            if (result) {
                this.update.next(0);
            }
        });
    }

    printD() {
        window.print();
    }
    edit(o: Client) {
        //this.Router.navigate(['/client/update', o.id]);

        this.openDialog(o, 'Modifier Role').subscribe((result: Client) => {
            if (result) {
                this.update.next(0);
            }
        });
    }

    remove(o: Client) {
        console.warn('remove fun')
        this.delete$.next(o);
    }
    //   async delete(o: Client) {
    //     const r = await this.service.deleteDialog.openDialog('client').toPromise();
    //     if (r === 'ok') {
    //       const sub = this.service.clients.delete(o.id).subscribe(() => this.update.next(true));

    //       // this.subs.push(sub);
    //     }
    //   }
}
