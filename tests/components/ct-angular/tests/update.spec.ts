import { expect, test } from '@playwright/experimental-ct-angular';
// This fails
// SyntaxError: Identifier 'CounterComponent' has already been declared
// import { value, CounterComponent } from '@/components/counter.component';

// Workaround:
// Import component usages
// Then import non-component usages separately
import { CounterComponent } from '@/components/counter.component';
import { value, CounterComponent as CounterComponentTestRef } from '@/components/counter.component';
console.log(CounterComponentTestRef) // renaming imports also works!

test('should mount', async ({ mount }) => {
  const component = await mount(CounterComponent);
  await expect(component).toHaveText(`${value.count}`)
});
