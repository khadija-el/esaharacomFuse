import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription, of, take } from 'rxjs';
import { Client } from '../../Models/models';
import { clientService } from '../../Services/client.service';
import { ActivatedRoute,  Router } from '@angular/router';
import {  MatCardModule } from '@angular/material/card';
import {  MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

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
export class UpdateComponent implements OnInit,OnDestroy {
  subs: Subscription[] = [];

  myForm : UntypedFormGroup;
  o = new Client();
  title = '  Modification Article';
  unites = of([])
  taxes = of([])
  isDialog = false;

  constructor(private fb: UntypedFormBuilder,
    private service: clientService,
    private route: ActivatedRoute,
    private router: Router){ }

  async ngOnInit() {
    this.createForm();

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

  async delete(o: Client) {
    const r = await this.service.deleteDialog.openDialog('client').toPromise();
    if (r === 'ok') {
      const sub = this.service.delete(o.id).subscribe(() => {

        // this.back();
      });

      this.subs.push(sub);
    }
  }

  submit(o: Client): void {
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
      name: [this.o.name, []],
      tel: [this.o.tel, [Validators.required]],
      adresse: [this.o.adresse, []],
    });


  }

  resetForm() {
    this.o = new Client();
    this.createForm();
  }
  back(){
    this.router.navigate(['/dashboards/client']);

  }
  ngOnDestroy(): void {
    this.subs.forEach(e => {
      e.unsubscribe();
    });
  }
}
