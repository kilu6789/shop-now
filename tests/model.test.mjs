import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalize,
  addProduct,
  removeProduct,
  clearPurchased,
  validState,
} from "../src/model.mjs";
const empty = () => ({ version: 1, items: {}, usage: {}, custom: [] });
test("search tolerates Croatian accents, case and repeated whitespace", () => {
  assert.equal(normalize("  ŠEĆER   u prahu "), "secer u prahu");
  assert.equal(normalize("Đumbir"), "dumbir");
});
test("repeated adding does not duplicate or inflate frequency", () => {
  let s = addProduct(empty(), "milk");
  s = addProduct(s, "milk");
  assert.deepEqual(s.items, { milk: false });
  assert.equal(s.usage.milk, 1);
});
test("restoring purchased item does not count a new shopping round", () => {
  const s = addProduct(
    { ...addProduct(empty(), "milk"), items: { milk: true } },
    "milk",
  );
  assert.equal(s.items.milk, false);
  assert.equal(s.usage.milk, 1);
});
test("adding after removal counts a new round", () => {
  const s = addProduct(
    removeProduct(addProduct(empty(), "milk"), "milk"),
    "milk",
  );
  assert.equal(s.usage.milk, 2);
});
test("clear purchased preserves active products, catalog and usage", () => {
  const s = {
    ...empty(),
    items: { milk: true, bread: false },
    usage: { milk: 3 },
    custom: [{ id: "a" }],
  };
  const next = clearPurchased(s);
  assert.deepEqual(next.items, { bread: false });
  assert.deepEqual(next.usage, s.usage);
  assert.deepEqual(next.custom, s.custom);
  assert.equal(s.items.milk, true);
});
test("storage validation rejects corrupt data", () => {
  assert.ok(validState(empty()));
  assert.equal(validState({ ...empty(), items: { milk: "false" } }), false);
  assert.equal(validState({ ...empty(), usage: null }), false);
  assert.equal(validState({ version: 9 }), false);
});
