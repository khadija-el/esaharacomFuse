
import { Article, Client } from '../Models/models';
import { SuperService } from './super.service';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class clientService extends SuperService<Client> {
  constructor() {
    super('Client');
  }

}
