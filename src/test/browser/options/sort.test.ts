import { expect, test } from '@playwright/test'
import {
  getGroups,
  GroupConfigurationWithoutId,
  setGroups,
  waitAnimationsFinished,
} from '../util/evaluations'

test.use({
  viewport: {
    width: 400,
    height: 600,
  },
  headless: false,
})

test('Drag and drop groups', async ({ page }) => {
  await page.goto('http://localhost:6655/?context=options')

  const group1 = {
    title: 'Test Group 1',
    color: 'blue',
    matchers: [],
    options: { strict: true, merge: false },
  }
  const group2 = {
    title: 'Test Group 2',
    color: 'red',
    matchers: ['example.com', 'example.org'],
    options: { strict: true, merge: false },
  }
  const group3 = {
    title: 'Test Group 3',
    color: 'green',
    matchers: ['github.com'],
    options: { strict: true, merge: false },
  }

  // Define groups programmatically
  await page.evaluate(setGroups, [
    group1,
    group2,
    group3,
  ] as GroupConfigurationWithoutId[])

  // Reload the page to apply localStorage changes
  await page.reload()

  // Find sort mode button and click it
  await page.locator('.sort-button').click()

  // There should be three drag handles
  const dragHandles = page.locator('.drag-handle')
  await expect(dragHandles).toHaveCount(3)

  // Wait for group transition to finish
  await page
    .locator('body')
    .evaluate(waitAnimationsFinished)
    .catch(() => {})

  await page.dragAndDrop(
    '.group:not(.group + .group) .drag-handle',
    '.group:last-child .drag-handle',
  )

  // Validate groups structure in storage
  expect(await page.evaluate(getGroups)).toMatchObject([
    { id: expect.any(String), ...group2 },
    { id: expect.any(String), ...group3 },
    { id: expect.any(String), ...group1 },
  ])
})
