import { test, expect } from '@playwright/test'
import msg from '@/locale/en/messages.json' assert { type: 'json' }
import { getGroups, getValue } from '../util/evaluations'

test.use({
  viewport: {
    width: 400,
    height: 600,
  },
  headless: false,
})

test('Test group creation flow', async ({ page }) => {
  await page.goto('http://localhost:6655/?context=options')

  // Find "+" button and click it
  await page.locator('.add-button').click()

  // Await the dialog container to appear
  const dialogContainer = page.locator('.dialog-container')
  await expect(dialogContainer).toHaveCount(1)

  // Expect initial group preview to be empty and grey
  const previewLabel = dialogContainer.locator('.preview .group-label')
  expect(await previewLabel.textContent()).toBe('')

  const getPreviewColor = () =>
    previewLabel.evaluate(
      previewLabel => getComputedStyle(previewLabel).backgroundColor,
    )
  expect(await getPreviewColor()).toBe('rgb(95, 99, 105)')

  // Expect initial group name input to be empty
  const groupNameInput = dialogContainer.locator('.group-title')
  expect(await groupNameInput.evaluate(getValue)).toBe('')

  // Fill in a name and pick a color
  await groupNameInput.pressSequentially('Test Group')

  // Click the blue radio label to select the color
  await dialogContainer.locator(`text=${msg.colorBlue.message}`).click()

  // Show advanced options
  await dialogContainer.locator('.toggle-advanced-button').click()

  // Enable strict mode
  await dialogContainer.locator('#edit-dialog-strict').click()

  // Enable merge mode
  await dialogContainer.locator('#edit-dialog-merge').click()

  // Expect the preview to have updated
  expect(await previewLabel.textContent()).toBe('Test Group')
  expect(await getPreviewColor()).toBe('rgb(25, 116, 232)')

  // Save the new group
  await dialogContainer.locator(`text=${msg.buttonSave.message}`).click()

  // Wait for the dialog container to be gone
  await expect(page.locator('.dialog-container')).toHaveCount(0)

  // Ensure we got the groups list with one group
  const groupsList = page.locator('.groups')
  await expect(groupsList).toHaveCount(1)
  await expect(groupsList.locator('.group')).toHaveCount(1)

  // Input field for first URL pattern should appear
  await expect(page.locator('.pattern-list-new input')).toHaveCount(1)

  // Ensure that groups have been persisted through refresh
  await page.reload()

  const groupsListAfterRefresh = page.locator('.groups')
  await expect(groupsListAfterRefresh).toHaveCount(1)
  await expect(groupsListAfterRefresh.locator('.group')).toHaveCount(1)

  // Validate groups structure in storage
  expect(await page.evaluate(getGroups)).toMatchObject([
    {
      id: expect.any(String),
      title: 'Test Group',
      color: 'blue',
      matchers: [],
      options: { strict: true, merge: true },
    },
  ])
})
