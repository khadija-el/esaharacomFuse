import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCard, MatCardActions, MatCardContent, MatCardModule, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { Subscription, of, take } from 'rxjs';
import { Article } from '../../Models/models';
import { ActivatedRoute,Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ArticleService } from '../../Services/article.service';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    MatSelectModule,
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule

  ],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss'
})
export class UpdateComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];

  myForm : UntypedFormGroup;
  o = new Article();
  title = '  Modification Article';
  unites = of([])
  taxes = of([])
  isDialog = false;

  constructor(private fb: UntypedFormBuilder,
    private service: ArticleService,
    private route: ActivatedRoute,
    private router: Router) { }

  async ngOnInit() {
    this.createForm();

    // if (this.data?.model?.id === 0) {
    //   this.isDialog = true;
    //   return;
    // }

   const id = this.route.snapshot.paramMap.get('id');
    this.route.paramMap.pipe(take(1)).subscribe(e => {
      this.o.id = +e.get('id')!;

      if (this.o.id === 0) return;

      this.service.getById(this.o.id).subscribe(r => {
        this.o = r;
        this.myForm.patchValue(this.o);
      })
    });
  }

  async delete(o: Article) {
    const r = await this.service.deleteDialog.openDialog('Article').toPromise();
    if (r === 'ok') {
      const sub = this.service.delete(o.id).subscribe(() => {

        // this.back();
      });

      this.subs.push(sub);
    }
  }

  // back(): void {
  //   if (this.isDialog) {
  //     // this.dialogRef.close();
  //     return;
  //   }
  //   this.router.navigate([this.router.url.substring(0, this.router.url.indexOf('/update'))]);
  // }

  submit(o: Article): void {
    let sub = null;
    if (o.id === 0) {
      console.log(o);

      sub = this.service.post(o).subscribe(r => {
        this.service.snackAdd();
        // this.emitUploadSubmit();

        this.o = { ...o, id: r.id };
        console.log(r);
        console.log(o);
        console.log("<<<<<<<<<<<<<<<r>>>>>>>>>>>>>>>");

        // if (this.isDialog) {
        //   // this.dialogRef.close(this.o);
        //   return;
        // }

        this.myForm.get('id').setValue(r.id);
        this.router.navigate([this.router.url.replace(this.route.snapshot.paramMap.get('id'), r.id.toString())]);
      });
    } else {
      sub = this.service.put(o.id, o).subscribe(r => {
        this.service.snackUpdate();
      });
    }

    this.subs.push(sub);
  }

  createForm() {
    this.myForm = this.fb.group({
      id: [this.o.id],
      reference: [this.o.reference, []],
      designation: [this.o.designation, [Validators.required]],
      stockInitial: [this.o.StockInitial, []],
      stockFinal: [this.o.stockFinal, [Validators.min(1),]],
      qteAchete: [this.o.qteAchete, [Validators.min(1),]],
      qteVendue: [this.o.qteVendue],
      prixAchat_HT: [this.o.prixAchat_HT, []],
      prixAchat_TTC: [this.o.prixAchat_TTC, []],
      prixVente_HT: [this.o.prixVente_HT, []],
      prixVente_TTC: [this.o.prixVente_TTC, []],
      info: [this.o.info, []],
    });


  }

  resetForm() {
    this.o = new Article();
    this.createForm();
  }
  back(){
    this.router.navigate(['/article']);

  }
  ngOnDestroy(): void {
    this.subs.forEach(e => {
      e.unsubscribe();
    });
  }
}
