import { Component, OnInit, ViewChild, EventEmitter, Inject, OnDestroy, ViewEncapsulation, Input, AfterViewInit } from '@angular/core';
import { merge, Subscription, Subject } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { startWith, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ReactiveFormsModule, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { cloneDeep, sum } from 'lodash-es';
import { Article, Detail } from '../../Models/models';
import { SessionService } from '../../Services/session.service';
import { livraisonService } from '../../Services/livraison.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatTable, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-detailChilds',
  standalone:true,
  imports: [CommonModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatTableModule,
    ReactiveFormsModule

],
  templateUrl: './detailChilds.component.html',
  styleUrls: ['./detailChilds.component.scss'],
  // encapsulation : ViewEncapsulation.None,
})
export class DetailChildsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() form: UntypedFormGroup;
  @Input() serviceName: string;
  @Input() parent: {
    id: number
    montantHT: number
    montantTTC: number
    details: Detail[]
  };

  // @Input() submitEvent: Subject<boolean>;

  update = new Subject<boolean>();
  isLoadingResults = false;
  subs: Subscription[] = [];
  dataSource: Detail[] = [];

  // livraisonClient: number;

  totalHT = 0;
  totalTTC = 0;
  isTTC = new UntypedFormControl(JSON.parse(this.session.myStorage.getItem('isTTC') ?? 'false'));

  displayedColumns = [
    'id',
    'article',
    'designation',
    'qte',
    'prix',
    'montantHT',
    'montantTTC',
    'tva',
    'option'
  ];

  displayedColumnsFiltred = this.displayedColumns;

  articleFromBarcode: Article[] = [];

  constructor( private fb: UntypedFormBuilder
    , private router: Router, private route: ActivatedRoute
    , private session: SessionService,private service :livraisonService
  ) { }

  ngOnInit() {
    // this.livraisonClient = this.parent.id;// +this.route.snapshot.paramMap.get('id');

    this.service.realTimeHub.messageReceived.pipe( /*debounceTime(300),*/distinctUntilChanged()).subscribe(r => {
      // this.articleFromBarcode.push(r);

      const fg = this.rowChange(this.createForm(), r);

      this.dataSourceFA.insert(0, cloneDeep( fg), { emitEvent: false });

      this.dataSourceFA = cloneDeep(this.dataSourceFA);
    })
  }

  ngAfterViewInit(): void {
    const sub = merge(/*this.sort.sortChange, */this.update).pipe(startWith(null as any)).subscribe(
      r => {
        const id = this.route.snapshot.paramMap.get('id');
        if (+id === 0) {
          try {
            this.articleFromBarcode= JSON.parse( this.session.myStorage.getItem('articleFromBarcode'));

            const details = this.articleFromBarcode.map(e => {
              return this.rowChange(this.createForm(), e);
            });

            this.form.setControl('dataSource', new UntypedFormArray(details));

            this.session.myStorage.removeItem('articleFromBarcode')
          } catch (error) {

            this.add();
          }
          return;
        }

        this.getPage(
          0,
          0,//this.paginator.pageSize,
          this.sort.active ? this.sort.active : 'id',
          this.sort.direction ? this.sort.direction : 'desc',
          id
        );
      }
    );

    this.subs.push(sub);
    // this.submitEvent.subscribe(_ => this.submit());
    this.isTTC.valueChanges.pipe(startWith(false)).subscribe(isTTC => {

      this.session.myStorage.setItem('isTTC', isTTC.toString())

      this.displayedColumnsFiltred = this.displayedColumns.filter(e => {

        if (isTTC && ['prix', 'montantHT'].includes(e)) {
          return false;
        }

        return true;
      });


    });

    this.form.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((r: { dataSource: Detail[] }) => {

      // console.warn(r.dataSource.map(e => e.article))
      this.totalHT = sum(r.dataSource.map(e => +e.montantHT));
      this.totalTTC = sum(r.dataSource.map(e => +e.montantTTC));

      this.parent.montantHT = this.totalHT;
      this.parent.montantTTC = this.totalTTC;

      this.parent.details = cloneDeep(r.dataSource)
      this.parent.details = this.parent.details
        .filter(e => e.idArticle !== null)
        .map(e => {
          delete e.article;
          return e;
        });

    });
  }

  rowChange(row: UntypedFormGroup, e: Article = null) {
    console.log(row.value.montantHT, e)

    if (e) {
      row.get('idArticle').setValue(e.id);
      row.get('article').setValue(e.designation);
      row.get('prix').setValue(e.prixVente_HT);
    //   row.get('prixUnitaireTTC').setValue(e.prixVente_TTC);
      row.get('tva').setValue((e as any).tva);

      setTimeout(() => {
        this.add();
      }, 300);
    }

    const qte = +row.get('qte').value;
    const tva = +row.get('tva').value / 100;

    let prixUnitaireHT = +row.get('prix').value;
    const montantHT = ((qte * prixUnitaireHT) );// - tva;

    row.get('montantHT').setValue(+montantHT.toFixed(2));

    return row;
  }

  trackByFn(index: any, e: any) {
    return `${e.value.idArticle}`;
  }

  getPage(startIndex, pageSize, sortBy, sortDir, idParent) {
    this.isLoadingResults = true;

    const sub = this.service[this.serviceName].getAll(startIndex, pageSize, sortBy, sortDir, idParent).subscribe(
      (r: {list: Detail[]}) => {
        if (r.list.length === 0) {
          this.add();
        } else {

          this.form.setControl('dataSource', new UntypedFormArray(r.list.map(e => this.createForm(e))));
        }

        this.isLoadingResults = false;
      }, e => {
        this.isLoadingResults = false
      }
    );

    this.subs.push(sub);
  }

  get dataSourceFA(): UntypedFormArray {
    return this.form.get('dataSource') as UntypedFormArray;
  }

  set dataSourceFA(e: UntypedFormArray) {
    this.form.setControl('dataSource', e);
  }

  createForm(o = new Detail()) {

    return this.fb.group({
      id: [o.id],
      numero: [o.numero, []],
      qte: [o.qte, [Validators.min(1),]],
      prix: [o.prix, []],
      montantHT: [o.montantHT, []],
      montantTTC: [o.montantTTC, []],
      tva: [o.tva, []],
      idParent: [this.parent.id, [Validators.min(1),]],
      idArticle: [o.idArticle, [Validators.min(1),]],
      article: [o.article, [Validators.min(1),]],
    });
  }

  add() {
    this.dataSourceFA.insert(0, cloneDeep(this.createForm()), { emitEvent: false });
    this.dataSourceFA = cloneDeep(this.dataSourceFA);
  }

  async delete(index: number) {
    this.dataSourceFA.removeAt(index);
    this.dataSourceFA = cloneDeep(this.dataSourceFA);
  }

  ngOnDestroy(): void {
    this.subs.forEach(e => {
      e.unsubscribe();
    });
  }
}


