import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteService } from '../delete/delete.service';
import { environment } from 'app/environments/environment';


export class SuperService<T> {
  protected http = inject(HttpClient);
  protected urlApi: string = environment.apiUrl;
  snackBar = inject(MatSnackBar);
  deleteDialog = inject(DeleteService);

  constructor(public controller: string) { }

  get = () => this.http.get<T[]>(`${this.urlApi}/${this.controller}/Get`);

  count = () => this.http.get<number>(`${this.urlApi}/${this.controller}/Count`);

  // getById = (id:any) => this.http.get<T>(`${this.urlApi}/${this.controller}/getById/${id}`);

  post = (o: T) => this.http.post<T>(`${this.urlApi}/${this.controller}/Post`, o);

  put = (id: number | string, o: T) => this.http.put<any>(`${this.urlApi}/${this.controller}/Put/${id}`, o);

  delete = (id: any) => this.http.delete<any>(`${this.urlApi}/${this.controller}/Delete/${id}`);
  getById = (id:any) => this.http.get<T>(`${this.urlApi}/${this.controller}/GetById/${id}`);
  getForSelect = () => this.http.get<T>(`${this.urlApi}/${this.controller}/GetForSelect`);

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

}

