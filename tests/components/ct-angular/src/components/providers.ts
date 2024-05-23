import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

export const ROOT_PROVIDERS = [
  provideHttpClient()
]

@Component({
  standalone: true,
  selector: 'app-root',
  template: ``
})
export class RootComponent {}
