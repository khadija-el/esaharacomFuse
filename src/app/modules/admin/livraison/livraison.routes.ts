import { Routes } from '@angular/router';
import { LivraisonComponent } from './livraison.component';
import { UpdateComponent } from './update/update.component';

export default [
    {
        path     : '',
        component: LivraisonComponent,
    },
    {
        path     : ':id',
        component: UpdateComponent,
        title: 'livraison  update',
    },
] as Routes;
