
import { Routes } from '@angular/router';
import { ClientComponent } from './client.component';

export default [
    {
        path     : '',
        component: ClientComponent,
        title: 'list',

    },

    { path: 'update/:id',
    loadComponent: () => import('./update/update.component').then(m => m.UpdateComponent)
    },
] as Routes;
