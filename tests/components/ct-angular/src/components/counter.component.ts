import { Component, input, output } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <div (click)="submit.emit('hello')">
      <div data-testid="props">{{ count() }}</div>
      <div data-testid="remount-count">{{ this.remountCount }}</div>
      <ng-content select="[main]"></ng-content>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 20px;
    }
  `]
})
export class CounterComponent {
  remountCount = Number(localStorage.getItem('remountCount'));
  count = input.required<number>();

  submit = output<string>()

  constructor() {
    localStorage.setItem('remountCount', String(this.remountCount++))
  }
}
