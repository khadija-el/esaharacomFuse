import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ArticleService } from './article.service';
import { isPlatformServer } from '@angular/common';
import { clientService } from './client.service';
import { DeleteService } from 'app/modules/admin/delete/delete.service';
import { MatDialog } from '@angular/material/dialog';
import { SessionService } from './session.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, map, of, take, tap } from 'rxjs';
import { SnackService } from '@fuse/services/snack/snack.service';
import { FormControl, FormGroup } from '@angular/forms';
import { LivraisonService } from './livraison.service';


@Injectable({
  providedIn: 'root'
})
export class UowService {
  config = {};// new ConfigService();
  articles = inject(ArticleService);
  clients = inject(clientService);
  livraisons = inject(LivraisonService);

  //utils
 //   shared = inject(SharedService);
  snackBar = inject(MatSnackBar);
  readonly fuseConfirmation = inject(FuseConfirmationService);
  readonly snack = inject(SnackService);


  deleteDialog = inject(DeleteService);
  session = inject(SessionService);
  platformId = inject(PLATFORM_ID);
  isServer = isPlatformServer(this.platformId);

  constructor(public dialog: MatDialog) { }

  snackGen(message = '', action = null, config = { panelClass: ['green-snackbar'], duration: 2000 }) {
    this.snackBar.open(message, action, config);
  }

  snackOk(message = 'Sauvegarde ressié') {
    const config = {
      panelClass: ['green-snackbar'],
      duration: 2000
    };

    this.snackBar.open(message, null, config);
  }

  snackAdd(message = 'Element successfully Added') {
    const config = {
      panelClass: ['green-snackbar'],
      duration: 2000
    };

    this.snackBar.open(message, null, config);
  }

  snackUpdate(message = 'Element successfully Updated') {
    const config = {
      panelClass: ['green-snackbar'],
      duration: 2000
    };

    this.snackBar.open(message, null, config);
  }

  snackDelete(message = 'Element successfully Deleted') {
    const config = {
      panelClass: ['green-snackbar'],
      duration: 2000
    };

    this.snackBar.open(message, null, config);
  }

  valideDate(date: Date): Date {
    date = new Date(date);

    const hoursDiff = date.getHours() - date.getTimezoneOffset() / 60;
    const minutesDiff = (date.getHours() - date.getTimezoneOffset()) % 60;
    date.setHours(hoursDiff);
    date.setMinutes(minutesDiff);

    return date;
  }

  logInvalidFields = (form: FormGroup) => console.warn(Object.entries(form.controls).filter(([key, e]) => e.invalid).map(([key, e]) => ({ name: key, status: e.valid })));

  handleError = <T>(e: HttpErrorResponse, source: Observable<T>) => of({ code: -10, message: `${e.status} : ${e.message}` }).pipe(
    tap(_ => console.dir(e)),
    take(1),
    tap(e => this.snack.open(e.message)),
    map(e => e as T & { code: number, message: string }),
    // switchMap(_ => source),
)

}
export type TypeForm<T> = {
    [Property in keyof T]: FormControl<T[Property]>;
    // [K in keyof T]: T[K] extends FormControl<infer U> ? U : T[K]
};
