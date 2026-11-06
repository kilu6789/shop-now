import { test, expect } from "@playwright/test";
test("mobile shopping flow persists, avoids duplicates and supports undo", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Što nam treba?" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Dodaj namirnice", exact: false })
    .click();
  await page.getByRole("searchbox").fill("mlijeko");
  await page
    .getByRole("button", { name: "Dodaj: Mlijeko", exact: true })
    .click();
  await page.getByRole("button", { name: "Povećaj količinu: Mlijeko" }).click();
  await page.getByRole("button", { name: "Natrag na našu listu" }).click();
  await expect(
    page.getByRole("button", { name: "Označi kupljeno: Mlijeko" }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Označi kupljeno: Mlijeko" }).click();
  await expect(
    page.getByRole("button", { name: "Vrati na listu: Mlijeko" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Vrati na listu: Mlijeko" }).click();
  await expect(
    page.getByRole("status", { name: "Broj komada: Mlijeko" }),
  ).toHaveText("2");
  await page.getByRole("button", { name: "Smanji količinu: Mlijeko" }).click();
  await expect(
    page.getByRole("status", { name: "Broj komada: Mlijeko" }),
  ).toHaveText("1");
  await page.getByRole("button", { name: "Označi kupljeno: Mlijeko" }).click();
  await page.getByRole("button", { name: "Očisti", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Vrati na listu: Mlijeko" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Poništi", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Vrati na listu: Mlijeko" }),
  ).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  await page.screenshot({
    path: "test-results/mobile-list.png",
    fullPage: true,
  });
});
test("custom products are searchable, editable, persistent and removable", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Dodaj namirnice", exact: false })
    .click();
  await page.getByRole("searchbox").fill("Proteinsko pecivo");
  await page
    .getByRole("button", { name: "Dodaj novu namirnicu", exact: false })
    .click();
  await page
    .getByRole("combobox", { name: "Kategorija", exact: true })
    .selectOption("bakery");
  await page.getByRole("button", { name: "Spremi i dodaj" }).click();
  await page.getByRole("searchbox").fill("PROTEINSKO");
  await expect(
    page.getByRole("status", { name: "Broj komada: Proteinsko pecivo" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Uredi Proteinsko pecivo" }).click();
  await page
    .getByRole("textbox", { name: "Naziv", exact: true })
    .fill("Proteinsko pecivo veliko");
  await page.getByRole("button", { name: "Spremi promjene" }).click();
  await page.getByRole("button", { name: "Gotovo", exact: false }).click();
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Označi kupljeno: Proteinsko pecivo veliko",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Ukloni Proteinsko pecivo veliko s liste" })
    .click();
  await page
    .getByRole("button", { name: "Dodaj namirnice", exact: false })
    .click();
  await page.getByRole("searchbox").fill("proteinsko");
  await page
    .getByRole("button", { name: "Uredi Proteinsko pecivo veliko" })
    .click();
  await page.getByRole("button", { name: "Ukloni iz kataloga" }).click();
  await expect(
    page.getByRole("button", { name: "Dodaj: Proteinsko pecivo veliko" }),
  ).toHaveCount(0);
});
test("failed local storage does not falsely add a product", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page
    .getByRole("button", { name: "Dodaj namirnice", exact: false })
    .click();
  await page.getByRole("searchbox").fill("mlijeko");
  await page
    .getByRole("button", { name: "Dodaj: Mlijeko", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Spremanje nije uspjelo");
  await expect(
    page.getByRole("button", { name: "Dodaj: Mlijeko", exact: true }),
  ).toBeVisible();
});

test("home copy, browser back and legacy saved list", async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("nasa-lista-v1"))
      localStorage.setItem(
        "nasa-lista-v1",
        JSON.stringify({
          version: 1,
          items: { "dairy-0": false },
          usage: { "dairy-0": 1 },
          custom: [],
        }),
      );
  });
  await page.goto("/");
  await expect(
    page.getByText("Shopping lista za Klaru i Lukasa"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Otvori katalog", exact: false }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("status", { name: "Broj komada: Mlijeko" }),
  ).toHaveText("1");
  await page
    .getByRole("button", { name: "Dodaj namirnice", exact: false })
    .click();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Naša lista." }),
  ).toBeVisible();
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
