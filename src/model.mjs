export const normalize = (value) =>
  value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("hr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
export function addProduct(state, id) {
  if (state.items[id] === false) return changeQuantity(state, id, 1);
  const fresh = !(id in state.items);
  return {
    ...state,
    items: { ...state.items, [id]: false },
    quantities: {
      ...state.quantities,
      [id]: state.items[id] === true ? state.quantities?.[id] || 1 : 1,
    },
    usage: { ...state.usage, [id]: (state.usage[id] || 0) + (fresh ? 1 : 0) },
  };
}
export function removeProduct(state, id) {
  const items = { ...state.items };
  delete items[id];
  const quantities = { ...state.quantities };
  delete quantities[id];
  return { ...state, items, quantities };
}
export function changeQuantity(state, id, delta) {
  if (!(id in state.items)) return state;
  const quantity = (state.quantities?.[id] || 1) + delta;
  if (quantity <= 0) return removeProduct(state, id);
  return { ...state, quantities: { ...state.quantities, [id]: quantity } };
}
export function clearPurchased(state) {
  return {
    ...state,
    quantities: Object.fromEntries(
      Object.entries(state.quantities || {}).filter(
        ([id]) => state.items[id] === false,
      ),
    ),
    items: Object.fromEntries(
      Object.entries(state.items).filter(([, bought]) => !bought),
    ),
  };
}
export function validState(s) {
  return (
    !!s &&
    s.version === 1 &&
    (s.quantities === undefined ||
      (s.quantities !== null &&
        typeof s.quantities === "object" &&
        !Array.isArray(s.quantities) &&
        Object.values(s.quantities).every(
          (q) => Number.isSafeInteger(q) && q > 0,
        ))) &&
    typeof s.items === "object" &&
    s.items !== null &&
    !Array.isArray(s.items) &&
    Object.values(s.items).every((v) => typeof v === "boolean") &&
    typeof s.usage === "object" &&
    s.usage !== null &&
    Object.values(s.usage).every((v) => Number.isInteger(v) && v >= 0) &&
    Array.isArray(s.custom) &&
    s.custom.every(
      (p) =>
        p &&
        typeof p.id === "string" &&
        typeof p.name === "string" &&
        typeof p.category === "string" &&
        p.custom === true,
    )
  );
}
