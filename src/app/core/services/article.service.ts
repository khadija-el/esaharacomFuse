
import { Article } from '../Models/models';
import { SuperService } from './super.service';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ArticleService extends SuperService<Article> {
  constructor() {
    super('Article');
  }
  
}