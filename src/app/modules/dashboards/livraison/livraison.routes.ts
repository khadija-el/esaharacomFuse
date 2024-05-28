
import { Routes } from '@angular/router';
import { LivraisonComponent } from './livraison.component';

export default [
    {
        path     : '',
        component: LivraisonComponent,
        title: 'list',

    },

    {
        path: 'update/:id',
        loadComponent: () => import('./update/update.component').then(m => m.UpdateComponent)
    },
] as Routes;
