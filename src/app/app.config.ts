import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
//import { provideFontAwesomeConfig } from '@fortawesome/angular-fontawesome';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(routes),
     provideHttpClient(),
    provideAnimationsAsync(),
    // provideFontAwesomeConfig({
    //   defaultPrefix: 'fas'
    // })
    
    
  ]
  
}; 




