import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
import { MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort } from '@angular/material/sort';
import { Subject, Subscription, merge, startWith } from 'rxjs';
import { Article } from '../Models/models';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { ArticleService } from '../Services/article.service';
import { __await } from 'tslib';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [MatDividerModule,
    MatFormFieldModule,
    MatCardModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    MatIconModule],
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

  constructor(private router: Router, private route: ActivatedRoute, private service: ArticleService) { }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    const sub = this.service.get().subscribe(
      (r: any) => {
        console.log(r);
        this.dataSource = r;
      }

    );
    console.log("<<<<<<<<<<<<>>>>>>>>>>");

  }

  add() {

    this.router.navigate(['/dashboards/article/update', 0]);
    // this.router.navigate(['update', 0], { relativeTo: this.route });
  }

  edit(o: Article) {

    this.router.navigate(['/dashboards/article/update', o.id]);
    // this.router.navigate(['update', o.id], { relativeTo: this.route });

  }
 printD(){
window.print();
 }
  async delete(o: Article) {
    const r = await this.service.deleteDialog.openDialog('Article').toPromise();
    if (r === 'ok') {
      const sub = this.service.delete(o.id).subscribe(() => this.update.next(true));

      // this.subs.push(sub);
    }
  }

}
