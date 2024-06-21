import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Observable, Subject, catchError, switchMap, takeUntil, filter, map, tap, merge, startWith, take } from 'rxjs';
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
import { MatSort, MatSortModule } from '@angular/material/sort';
import { UpdateComponent } from './update/update.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
        MatProgressBarModule,
        MatSortModule,
        MatTableModule,
        MatDialogModule, CommonModule, MatInputModule],

    templateUrl: './client.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientComponent {

    readonly dialog = inject(MatDialog);
    readonly uow = inject(UowService);
    readonly paginator: MatPaginator;
    readonly sort: MatSort;

    isLoading: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    readonly showMessage$ = new Subject<any>();
    readonly update = new Subject<number>();
    //public isLoadingResults = true;

    readonly delete$ = new Subject<Client>();
    readonly #delete$ = this.delete$.pipe(
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

   // readonly viewInitDone = new Subject<void>();

    readonly clients$ = merge(
        this.update,
        this.#delete$,
    ).pipe(
        startWith(null),
        switchMap(_ => this.uow.clients.get())
        // map(list => list),
    )

    panelOpenState = false;

    openDialog(o: Client, text) {
        const dialogRef = this.dialog.open(UpdateComponent, {
            // width: '1100px',
            disableClose: true,
            data: { model: o, title: text }
        });

        return dialogRef.afterClosed();
    };
    add() {

        this.openDialog({} as Client, 'Ajouter Client').subscribe(result => {
            if (result) {
                this.update.next(0);
            }
        });
    }

    edit(o: Client) {

        this.openDialog(o, 'Modifier client').subscribe((result: Client) => {
            if (result) {
                this.update.next(o.id);
            }
        });
    }
    search() {
        this.update.next(0);
    }
    remove(o: Client) {
        this.delete$.next(o);
    }

}
