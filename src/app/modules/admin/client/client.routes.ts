import { Routes } from '@angular/router';
import { ClientComponent } from './client.component';
import { UpdateComponent } from './update/update.component';

export default [
    {
        path     : '',
        component: ClientComponent,
    },
    {
        path     : ':id',
        component: UpdateComponent,
        title: 'client  update',
    },
] as Routes;
