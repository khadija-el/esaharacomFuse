import { Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCardModule  } from '@angular/material/card';
import { MatError, MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { Subject, Subscription, catchError, delay, filter, map, of, switchMap, take, tap } from 'rxjs';
import { ActivatedRoute,Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TypeForm, UowService } from 'app/core/services/uow.service';
import { Article } from 'app/core/Models/models';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { FuseAlertComponent } from '@fuse/components/alert';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    MatSelectModule,
    MatCardModule,
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    FuseAlertComponent

  ],
  templateUrl: './update.component.html',

})
export class UpdateComponent   {

    subs: Subscription[] = [];
    readonly fb = inject(FormBuilder);
    readonly uow = inject(UowService);
    readonly route = inject(ActivatedRoute);
    readonly router = inject(Router);
    // can not work in page
    readonly dialogRef = inject(MatDialogRef);
    readonly data = inject(MAT_DIALOG_DATA);

    readonly showMessage$ = new Subject<any>();

    readonly patchForm = toSignal(of(this.data).pipe(
        delay(10),
        tap(e => this.myForm.patchValue(e.model)),
    ));

    readonly myForm: FormGroup<TypeForm<Article>> = this.fb.group({
        id: [0],
        reference: [null, [Validators.required]],
        designation: [null, [Validators.required]],
        stockInitial : [null, [Validators.required]],
        stockFinal : [null, [Validators.required]],
        qteAchete : [null, [Validators.required]],
        qteVendue : [null, [Validators.required]],
        prixAchat_HT : [null, [Validators.required]],
        prixAchat_TTC : [null, [Validators.required]],
        prixVente_HT : [null, [Validators.required]],
        prixVente_TTC : [null, [Validators.required]],
        info : [null, [Validators.required]],

    }) as any;

    readonly post$ = new Subject<void>();
    readonly #post$ = toSignal(this.post$.pipe(
        tap(_ => this.uow.logInvalidFields(this.myForm)),
        tap(_ => this.myForm.markAllAsTouched()),
        filter(_ => this.myForm.valid && this.myForm.dirty),
        tap(_ => this.myForm.disable()),
        map(_ => this.myForm.getRawValue()),
        switchMap(o => this.uow.articles.post(o).pipe(
            catchError(this.uow.handleError),
            map((e: any) => ({ code: e.code < 0 ? -1 : 1, message: e.code < 0 ? e.message : 'Enregistrement réussi' })),
        )),
        tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
        filter(r => r.code === 1),
        delay(500),
        tap((r) => this.myForm.enable()),
        tap(r => this.back(r)),
    ));

    readonly put$ = new Subject<void>();
    readonly #put$ = toSignal(this.put$.pipe(
        tap(_ => this.uow.logInvalidFields(this.myForm)),
        tap(_ => this.myForm.markAllAsTouched()),
        filter(_ => this.myForm.valid && this.myForm.dirty),
        tap(_ => this.myForm.disable()),
        map(_ => this.myForm.getRawValue()),
        switchMap(o => this.uow.articles.put(o.id, o).pipe(
            catchError(this.uow.handleError),
            map((e: any) => ({ code: e?.code < 0 ? -1 : 1, message: e?.code < 0 ? e?.message : 'Enregistrement réussi' })),
        )),
        tap(r => this.showMessage$.next({ message: r.message, code: r.code })),
        filter(r => r.code === 1),
        delay(500),
        tap((r) => this.myForm.enable()),
        tap(r => this.back(r)),
    ));

    readonly model = toSignal(this.route.paramMap.pipe(
        take(1),
        map(e => +(e.get('id') ?? 0)),
        filter(id => id !== 0),
        switchMap(id => this.uow.articles.getById(id)),
        tap(r => this.myForm.patchValue(r)),
    ));

    submit = (e: Article) => e.id === 0 ? this.post$.next() : this.put$.next();
    back = (e?: Article) => {
        this.dialogRef.close(e)
    };

}

