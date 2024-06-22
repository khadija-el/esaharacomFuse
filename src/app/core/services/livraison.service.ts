
import { Livraison } from '../Models/models';
import { SuperService } from './super.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LivraisonService extends SuperService<Livraison> {

  constructor() {
    super('livraison');
  }

  getAll(startIndex, pageSize, numero, dateDebut, dateFin, montantTTC, idClient) {
    return this.http.get(`${this.urlApi}/${this.controller}/getAll/${startIndex}/${pageSize}/${numero}/${dateDebut}/${dateFin}/${montantTTC}/${idClient}`);
  }
}
