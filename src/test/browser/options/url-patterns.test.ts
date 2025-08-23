import { expect, test } from '@playwright/test'
import {
  getGroups,
  getValue,
  GroupConfigurationWithoutId,
  isFocused,
  isValid,
  setGroups,
} from '../util/evaluations'

test.use({
  viewport: {
    width: 400,
    height: 600,
  },
  headless: false,
})

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:6655/?context=options')

  // Define groups programmatically
  await page.evaluate(setGroups, [
    {
      title: 'Test Group',
      color: 'blue',
      matchers: [],
      options: { strict: true, merge: false },
    } as GroupConfigurationWithoutId,
  ])

  // Reload the page to apply localStorage changes
  await page.reload()
})

test('Add URL patterns via "add link" button and Enter key', async ({
  page,
}) => {
  // No inputs should be there initially
  const urlPatternInputs = page.locator('mwc-textfield.textfield')
  await expect(urlPatternInputs).toHaveCount(0)

  // Find "add link" button and click it
  const addLinkButton = page.locator('text=add_link')
  await addLinkButton.click()

  // After clicking the button, there should be one input
  const urlPatternInput = page.locator('mwc-textfield.textfield')
  await expect(urlPatternInput).toHaveCount(1)

  await urlPatternInput.pressSequentially('example.com')

  // Expect a new empty, focused input to appear after pressing enter
  await urlPatternInput.press('Enter')
  const urlPatternInputsAfterEnter = page.locator('mwc-textfield.textfield')
  await expect(urlPatternInputsAfterEnter).toHaveCount(2)

  const lasturlPatternInputAfterEnter = urlPatternInputsAfterEnter.last()
  await expect(await lasturlPatternInputAfterEnter.evaluate(isFocused)).toBe(
    true,
  )

  // Expect the new input to disappear again ater pressing Backspace
  await lasturlPatternInputAfterEnter.press('Backspace')

  const urlPatternInputsAfterBackspace = page.locator('mwc-textfield.textfield')
  await expect(urlPatternInputsAfterBackspace).toHaveCount(1)
  await expect(await urlPatternInputsAfterBackspace.evaluate(getValue)).toBe(
    'example.com',
  )

  // Expect a new empty, focused input to appear after clicking the "add link" button
  await addLinkButton.click()

  const urlPatternInputsAfterAddLink = page.locator('mwc-textfield.textfield')
  await expect(urlPatternInputsAfterAddLink).toHaveCount(2)

  const lasturlPatternInputAfterAddLink = urlPatternInputsAfterAddLink.last()
  await expect(await lasturlPatternInputAfterAddLink.evaluate(isFocused)).toBe(
    true,
  )

  // Expect the new empty input to disappear again when focusing anything else
  await page.click('body')

  await expect(page.locator('mwc-textfield.textfield')).toHaveCount(1)

  // Validate groups structure in storage
  expect(await page.evaluate(getGroups)).toMatchObject([
    {
      id: expect.any(String),
      title: 'Test Group',
      color: 'blue',
      matchers: ['example.com'],
      options: { strict: true },
    },
  ])
})

test('Report error on invalid pattern and prevent from adding new ones', async ({
  page,
}) => {
  // No inputs should be there initially
  const urlPatternInputs = page.locator('mwc-textfield.textfield')
  await expect(urlPatternInputs).toHaveCount(0)

  // Find "add link" button and click it
  const addLinkButton = page.locator('text=add_link')
  await addLinkButton.click()

  // After clicking the button, there should be one input
  const urlPatternInput = page.locator('mwc-textfield.textfield')
  await expect(urlPatternInput).toHaveCount(1)

  // Insert an invalid pattern and press enter
  await urlPatternInput.pressSequentially(':')
  await urlPatternInput.press('Enter')

  // Expect the input to be invalid and no other inputs to appear
  await urlPatternInput.press('Enter')
  expect(await urlPatternInput.evaluate(isFocused)).toBe(true)
  expect(await urlPatternInput.evaluate(getValue)).toBe(':')
  expect(await urlPatternInput.evaluate(isValid)).toBe(false)

  const urlPatternInputsAfterEnter = page.locator('mwc-textfield.textfield')
  await expect(urlPatternInputsAfterEnter).toHaveCount(1)

  // Even pressing the "add link" button should not add new textfields
  await addLinkButton.click()
  const urlPatternInputsAfterAddLink = page.locator('mwc-textfield.textfield')
  await expect(urlPatternInputsAfterAddLink).toHaveCount(1)

  // URL patterns should not have been saved
  await page.click('body')

  // Validate groups structure in storage
  expect(await page.evaluate(getGroups)).toMatchObject([
    {
      id: expect.any(String),
      title: 'Test Group',
      color: 'blue',
      matchers: [],
      options: { strict: true },
    },
  ])
})
