export const normalize = (value) =>
  value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("hr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
export function addProduct(state, id) {
  if (state.items[id] === false) return state;
  const fresh = !(id in state.items);
  return {
    ...state,
    items: { ...state.items, [id]: false },
    usage: { ...state.usage, [id]: (state.usage[id] || 0) + (fresh ? 1 : 0) },
  };
}
export function removeProduct(state, id) {
  const items = { ...state.items };
  delete items[id];
  return { ...state, items };
}
export function clearPurchased(state) {
  return {
    ...state,
    items: Object.fromEntries(
      Object.entries(state.items).filter(([, bought]) => !bought),
    ),
  };
}
export function validState(s) {
  return (
    !!s &&
    s.version === 1 &&
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
