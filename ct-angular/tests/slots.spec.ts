import { test, expect } from '@sand4rt/experimental-ct-angular';
import { DefaultSlotComponent } from '@/components/default-slot.component';
import { NamedSlotsComponent } from '@/components/named-slots.component';

test('render a default slot', async ({ mount }) => {
  const component = await mount(DefaultSlotComponent, {
    slots: {
      default: '<strong>Main Content</strong>',
    },
  });
  await expect(component.getByRole('strong')).toContainText('Main Content');
});

test('render a component with multiple slots', async ({ mount }) => {
  const component = await mount(DefaultSlotComponent, {
    slots: {
      default: [
        '<div data-testid="one">One</div>',
        '<div data-testid="two">Two</div>',
      ],
    },
  });
  await expect(component.getByTestId('one')).toContainText('One');
  await expect(component.getByTestId('two')).toContainText('Two');
});

test('render a component with a named slots', async ({ mount }) => {
  const component = await mount(NamedSlotsComponent, {
    slots: {
      header: '<div header>Header</div>', // <div header is optional
      main: '<div>Main Content</div>',
      footer: '<div>Footer</div>',
    },
  });
  await expect(component).toContainText('Header');
  await expect(component).toContainText('Main Content');
  await expect(component).toContainText('Footer');
});
