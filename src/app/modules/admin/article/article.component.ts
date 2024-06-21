import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {  MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule, } from '@angular/material/expansion';
import {  MatFormFieldModule,  } from '@angular/material/form-field';
import {  MatIconModule } from '@angular/material/icon';
import {  MatPaginatorModule } from '@angular/material/paginator';
import {  MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort } from '@angular/material/sort';
import { Subject, Subscription, merge, startWith } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { __await } from 'tslib';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Article } from 'app/core/Models/models';
import { UowService } from 'app/core/services/uow.service';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatTableModule,
    MatDialogModule],
  templateUrl: './article.component.html',
  styleUrl: './article.component.scss'
})
export class ArticleComponent implements OnInit, OnDestroy {
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;

  update = new Subject<boolean>();

  dataSource: Article[] = [];

  displayedColumns = [
    //  'select',
    'reference',
    'designation',
    'stockInitial',
    'stockFinal',
    'qteAchete',
    'qteVendue',
    'prixAchat_HT',
    'prixAchat_TTC',
    'prixVente_HT',
    'prixVente_TTC',
    'info',
    'option'
  ];

  panelOpenState = false;

  reference = new FormControl('');
  designation = new FormControl('');

  constructor(private router: Router, private route: ActivatedRoute, private service: UowService) { }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    const sub = this.service.articles.get().subscribe(
      (r: any) => {
        console.log(r);
        this.dataSource = r;
      }

    );
    console.log("<<<<<<<<<<<<>>>>>>>>>>");

  }

  add() {

    this.router.navigate(['/article/update', 0]);
    // this.router.navigate(['update', 0], { relativeTo: this.route });
  }

  edit(o: Article) {

    this.router.navigate(['/article/update', o.id]);
    // this.router.navigate(['update', o.id], { relativeTo: this.route });

  }
 printD(){
window.print();
 }
  async delete(o: Article) {
    const r = await this.service.deleteDialog.openDialog('Article').toPromise();
    if (r === 'ok') {
      const sub = this.service.articles.delete(o.id).subscribe(() => this.update.next(true));

      // this.subs.push(sub);
    }
  }

}
