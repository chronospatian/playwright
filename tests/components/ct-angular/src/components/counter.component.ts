import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    {{ value.count }}
  `,
})
export class CounterComponent {
  value = value

}

export const value = {
  count: 10
}

