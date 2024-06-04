import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  template: `
    {{ value.count }}
  `,
})
export class CounterComponent {
  value = value

  // Error: Standard Angular field decorators are not supported in JIT mode.
  // @Input() anything = null
}

export const value = {
  count: 10
}

