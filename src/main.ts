import { registerLocaleData } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr, 'fr-FR');
bootstrapApplication(AppComponent, appConfig)
    .catch(err => console.error(err));
