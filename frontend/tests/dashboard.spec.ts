import { expect, test } from "@playwright/test"

test.describe("Dashboard & Navigation", () => {
  test("Dashboard loads successfully with stats and quick actions", async ({
    page,
  }) => {
    await page.goto("/")

    // Verify greeting or user banner is visible
    await expect(
      page.getByText(/Good morning|Good afternoon|Good evening/),
    ).toBeVisible()

    // Verify Stat Cards are present
    await expect(page.getByText("Total Exoplanets")).toBeVisible()
    await expect(page.getByText("Habitable Worlds")).toBeVisible()

    // Verify Quick Actions
    await expect(page.getByText("Quick Actions")).toBeVisible()
  })

  test("Navigate from Dashboard to Exoplanets catalog via sidebar", async ({
    page,
  }) => {
    await page.goto("/")

    // Click Exoplanets link in sidebar
    await page.getByRole("link", { name: "Exoplanets" }).click()
    await page.waitForURL("**/exoplanets")

    // Verify catalog search bar is visible
    await expect(
      page.getByPlaceholder("Search exoplanets by name..."),
    ).toBeVisible()
  })

  test("Navigate to Admin Control Center via sidebar", async ({ page }) => {
    await page.goto("/")

    // Click Control Center link in sidebar
    await page.getByRole("link", { name: "Control Center" }).click()
    await page.waitForURL("**/admin/etl")

    // Verify Admin Control Center heading is visible
    await expect(
      page.getByRole("heading", { name: "Admin Control Center" }),
    ).toBeVisible()
  })
})
