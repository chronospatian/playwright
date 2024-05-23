import { Component, input, output } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-button',
  template: `
  <button (click)="click.emit('hello')">{{title()}}</button>
  `
})
export class ButtonComponent {
  title = input()
  click = output<string>({ alias: 'submit' })
}
