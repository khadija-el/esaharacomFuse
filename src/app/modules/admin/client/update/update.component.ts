import { MatFormFieldModule } from '@angular/material/form-field';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject, Subscription, catchError, delay, filter, map, of, switchMap, take, tap } from 'rxjs';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { MatCardActions, MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Client } from 'app/core/Models/models';
import { TypeForm, UowService } from 'app/core/services/uow.service';
import { MatIconModule } from '@angular/material/icon';
import { FuseAlertComponent } from '@fuse/components/alert';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { toSignal } from '@angular/core/rxjs-interop';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'app-update',
    standalone: true,
    animations: fuseAnimations,
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
        FormsModule,
        MatButtonModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        RouterLink,
        FuseAlertComponent,

    ],
    templateUrl: './update.component.html',

})
export class UpdateComponent {

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

    readonly myForm: FormGroup<TypeForm<Client>> = this.fb.group({
        id: [0],
        name: [null, [Validators.required]],
        tel: [null, [Validators.required]],
        adresse : [null, [Validators.required]],

    }) as any;

    readonly post$ = new Subject<void>();
    readonly #post$ = toSignal(this.post$.pipe(
        tap(_ => this.uow.logInvalidFields(this.myForm)),
        tap(_ => this.myForm.markAllAsTouched()),
        filter(_ => this.myForm.valid && this.myForm.dirty),
        tap(_ => this.myForm.disable()),
        map(_ => this.myForm.getRawValue()),
        switchMap(o => this.uow.clients.post(o).pipe(
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
        switchMap(o => this.uow.clients.put(o.id, o).pipe(
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
        switchMap(id => this.uow.clients.getById(id)),
        tap(r => this.myForm.patchValue(r)),
    ));

    submit = (e: Client) => e.id === 0 ? this.post$.next() : this.put$.next();
    back = (e?: Client) => {
        this.dialogRef.close(e)
    };

}
