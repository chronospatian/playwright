import { expect, test } from '@playwright/experimental-ct-angular';
import { ButtonWithText, Default } from '@/components/button.component.stories';

test('should render story', async ({ mount }) => {
  const component = await mount(Default)

  await expect(component).toBeInViewport()
})

test('should render story with props', async ({ mount }) => {
  const component = await mount(ButtonWithText)

  await expect(component).toHaveText('Click me')
})

test('should render story with different props', async ({ mount }) => {
  const text = 'Click again'
  const component = await mount(ButtonWithText, {
    props: {
      text
    }
  })

  await expect(component).toHaveText(text)
})
