import { ButtonComponent } from '@/components/button.component';
import { CounterComponent } from '@/components/counter.component';

export const Default = {
  imports: [ButtonComponent],
  template: `<app-button />`,
}

export const ButtonWithText = {
  extends: [Default],
  props: {
    text: 'Click me'
  },
  template: `<app-button [title]="text" />`,
}

export const ButtonWithCounter = {
  extends: [Default],
  imports: [CounterComponent],
  props: {
    count: 10
  },
  on: ['increment'],
  template: `
    <app-button (click)="increment.emit($event)">
      <app-counter [count]="count" />
      <span>{{text}}
    </app-button>
  `,
}

export const ButtonWithColor = {
  extends: [Default],
  props: {
    color: 'red'
  },
  template: `<app-button [color]="color">{{text}}</app-button>`
}
