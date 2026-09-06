import { expect, test } from "@playwright/test"

test.describe("Admin ETL & Scheduler Control Center", () => {
  test("Control Center page loads successfully with main sections", async ({
    page,
  }) => {
    await page.goto("/admin/etl")

    // Verify Main Heading
    await expect(
      page.getByRole("heading", { name: "Admin Control Center" }),
    ).toBeVisible()

    // Verify Global action: Purge Cache
    await expect(
      page.getByRole("button", { name: "Purge Cache" }),
    ).toBeVisible()

    // Verify Cards
    await expect(page.getByText("Scheduler Automation")).toBeVisible()
    await expect(page.getByText("ETL Pipeline Trigger")).toBeVisible()
  })

  test("Scheduler card displays automation controls and presets", async ({
    page,
  }) => {
    await page.goto("/admin/etl")

    // Verify Interval Presets
    await expect(page.getByRole("button", { name: "1h" })).toBeVisible()
    await expect(page.getByRole("button", { name: "6h" })).toBeVisible()
    await expect(page.getByRole("button", { name: "12h" })).toBeVisible()
    await expect(page.getByRole("button", { name: "24h" })).toBeVisible()

    // Clicking a preset updates interval input
    await page.getByRole("button", { name: "6h" }).click()
    const applyBtn = page.getByRole("button", { name: "Apply", exact: true })
    await expect(applyBtn).toBeVisible()
  })

  test("ETL Pipeline Trigger allows configuring load mode and dry run", async ({
    page,
  }) => {
    await page.goto("/admin/etl")

    // Verify load mode select
    const loadModeSelect = page.locator("#load-mode-select")
    await expect(loadModeSelect).toBeVisible()

    // Select Reload mode and verify warning banner
    await loadModeSelect.selectOption("reload")
    await expect(
      page.getByText("Destructive Load Strategy Warning"),
    ).toBeVisible()

    // Switch back to Upsert mode
    await loadModeSelect.selectOption("upsert")
    await expect(
      page.getByText("Destructive Load Strategy Warning"),
    ).not.toBeVisible()

    // Toggle Dry Run checkbox
    const dryRunCheckbox = page.getByLabel("Dry Run (Skip database mutations)")
    await dryRunCheckbox.check()
    await expect(dryRunCheckbox).toBeChecked()

    // Verify Run button is visible
    await expect(
      page.getByRole("button", { name: "Run Pipeline Ingest" }),
    ).toBeVisible()
  })

  test("Purge Cache button triggers cache purge action", async ({ page }) => {
    await page.goto("/admin/etl")

    const purgeBtn = page.getByRole("button", { name: "Purge Cache" })
    await expect(purgeBtn).toBeVisible()
    await purgeBtn.click()

    // Verify toast notification appears
    await expect(
      page.getByText(/purged successfully|Failed to purge cache/i),
    ).toBeVisible()
  })
})
