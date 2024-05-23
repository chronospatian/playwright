import '@/assets/styles.css';
import { TOKEN } from '@/components/inject.component';
import { routes } from '@/router';
import { APP_INITIALIZER, inject } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { afterMount, beforeMount } from '@playwright/experimental-ct-angular/hooks';
import { BrowserPlatformLocation, PlatformLocation } from '@angular/common';
import { ROOT_PROVIDERS } from '@/components/providers';

export type HooksConfig = {
  routing?: boolean;
  injectToken?: boolean;
};

beforeMount<HooksConfig>(async ({ hooksConfig, TestBed }) => {
  TestBed.configureTestingModule({
    providers: [ROOT_PROVIDERS]
  })

  if (hooksConfig?.routing)
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: PlatformLocation, useExisting: BrowserPlatformLocation },
        {
          provide: APP_INITIALIZER,
          multi: true,
          useFactory() {
            const router = inject(Router);
            return () => router.initialNavigation();
          }
        }
      ],
    });

  if (hooksConfig?.injectToken)
    TestBed.configureTestingModule({
      providers: [{ provide: TOKEN, useValue: { text: 'has been overwritten' }}]
    })
});

afterMount<HooksConfig>(async () => {
  console.log('After mount');
});
