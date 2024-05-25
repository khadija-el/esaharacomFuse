
import { Routes } from '@angular/router';
import { ArticleComponent } from './article.component';

export default [
    {
        path     : '',
        component: ArticleComponent,
        title: 'list',

    },
  //   {
  //     path     : '/print',
  //     component: PrintComponent,
  //     title: 'list',

  // },
{ path: 'update/:id', loadComponent: () => import('./update/update.component').then(m => m.UpdateComponent) },
] as Routes;
