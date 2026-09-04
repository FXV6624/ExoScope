import { expect, test } from "@playwright/test"

test.describe("Exoplanets Catalog & Export", () => {
  test("Exoplanets catalog renders toolbar with all action controls", async ({
    page,
  }) => {
    await page.goto("/exoplanets")

    // Verify Search input
    await expect(
      page.getByPlaceholder("Search exoplanets by name..."),
    ).toBeVisible()

    // Verify Toolbar buttons
    await expect(page.getByRole("button", { name: "Habitable" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Filters" })).toBeVisible()
    await expect(page.getByRole("button", { name: /Columns/ })).toBeVisible()
    await expect(page.getByRole("button", { name: "Export" })).toBeVisible()
  })

  test("Search input updates query state and can be cleared", async ({
    page,
  }) => {
    await page.goto("/exoplanets")

    const searchInput = page.getByPlaceholder("Search exoplanets by name...")
    await searchInput.fill("Kepler-22b")
    await expect(searchInput).toHaveValue("Kepler-22b")

    // Clear search button appears
    const clearButton = page.getByRole("button", { name: "Clear search" })
    await expect(clearButton).toBeVisible()

    await clearButton.click()
    await expect(searchInput).toHaveValue("")
    await expect(clearButton).not.toBeVisible()
  })

  test("Toggle habitable filter updates filter state", async ({ page }) => {
    await page.goto("/exoplanets")

    const habitableBtn = page.getByRole("button", { name: "Habitable" })
    await expect(habitableBtn).toBeVisible()

    // Click to enable filter
    await habitableBtn.click()
    await expect(habitableBtn).toContainText("✓")

    // Click to disable filter
    await habitableBtn.click()
    await expect(habitableBtn).not.toContainText("✓")
  })

  test("Export modal opens, displays formats and closes on Cancel", async ({
    page,
  }) => {
    await page.goto("/exoplanets")

    // Open Export Modal
    await page.getByRole("button", { name: "Export" }).click()

    // Verify Modal header
    await expect(page.getByText("Export Exoplanet Dataset")).toBeVisible()

    // Verify format options
    await expect(page.getByRole("button", { name: "CSV .csv" })).toBeVisible()
    await expect(page.getByRole("button", { name: "JSON .json" })).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Parquet .parquet" }),
    ).toBeVisible()

    // Select JSON format
    await page.getByRole("button", { name: "JSON .json" }).click()
    await expect(
      page.getByRole("button", { name: "Download JSON" }),
    ).toBeVisible()

    // Cancel / Close modal
    await page.getByRole("button", { name: "Cancel" }).click()
    await expect(page.getByText("Export Exoplanet Dataset")).not.toBeVisible()
  })
})
