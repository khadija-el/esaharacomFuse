import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {  MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule, } from '@angular/material/expansion';
import {  MatFormFieldModule,  } from '@angular/material/form-field';
import {  MatIconModule } from '@angular/material/icon';
import {  MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import {  MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Subject, Subscription, catchError, filter, map, merge, startWith, switchMap, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { __await } from 'tslib';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Article } from 'app/core/Models/models';
import { UowService } from 'app/core/services/uow.service';
import { UpdateComponent } from './update/update.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule,
    MatSortModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatTableModule,
    MatDialogModule,
    MatProgressBarModule,
   MatInputModule
     ],
  templateUrl: './article.component.html',

})
export class ArticleComponent   {
    readonly dialog = inject(MatDialog);
    readonly uow = inject(UowService);
    readonly paginator: MatPaginator;
    readonly sort: MatSort;

    isLoading: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    readonly showMessage$ = new Subject<any>();
    readonly update = new Subject<number>();

    readonly delete$ = new Subject<Article>();
    readonly #delete$ = this.delete$.pipe(
        switchMap(item => this.uow.fuseConfirmation.open().afterClosed().pipe(
            filter((e: 'confirmed' | 'cancelled') => e === 'confirmed'),
            tap(e => console.warn(e)),
            switchMap(_ => this.uow.articles.delete(item.id).pipe(
                catchError(this.uow.handleError),
                map((e: any) => ({ code: e?.code < 0 ? -1 : 1, message: e?.code < 0 ? e.message : 'Enregistrement réussi' })),
                tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
            )),
        )),
    );

   // readonly viewInitDone = new Subject<void>();

    readonly articles$ = merge(
        this.update,
        this.#delete$,
    ).pipe(
        startWith(null),
        switchMap(_ => this.uow.articles.get())
        // map(list => list),
    )

    //panelOpenState = false;

    openDialog(o: Article, text) {
        const dialogRef = this.dialog.open(UpdateComponent, {
            // width: '1100px',
            disableClose: true,
            data: { model: o, title: text }
        });

        return dialogRef.afterClosed();
    };
    add() {

        this.openDialog({} as Article, 'Ajouter Article').subscribe(result => {
            if (result) {
                this.update.next(0);
            }
        });
    }

    edit(o: Article) {

        this.openDialog(o, 'Modifier Article').subscribe((result: Article) => {
            if (result) {
                this.update.next(o.id);
            }
        });
    }
    search() {
        this.update.next(0);
    }
    remove(o: Article) {
        this.delete$.next(o);
    }

}
