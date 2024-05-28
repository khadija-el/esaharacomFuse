
import { Article, Client, Livraison } from '../Models/models';
import { RealTimeHubService } from './real-time.hub.service';
import { SuperService } from './super.service';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class livraisonService extends SuperService<Livraison> {
  constructor() {
    super('Livraison');
  }
  realTimeHub = inject(RealTimeHubService);

  getAll(startIndex:any, pageSize:any, numero:any, dateDebut:any, dateFin:any, montantTTCMin:any, montantTTCMax:any, idClient:any) {
    return this.http.get(`${this.urlApi}/${this.controller}/GetPage/${startIndex}/${pageSize}/${numero}/${dateDebut}/${dateFin}/${montantTTCMin}/${montantTTCMax}/${idClient}`);
  }

}
