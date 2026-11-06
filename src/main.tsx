import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { categories, catalog, popular, type Product } from "./catalog";
import {
  normalize,
  addProduct,
  removeProduct,
  clearPurchased,
  validState,
} from "./model.mjs";
import "./style.css";
type State = {
  version: 1;
  items: Record<string, boolean>;
  usage: Record<string, number>;
  custom: Product[];
};
const key = "nasa-lista-v1";
const empty: State = { version: 1, items: {}, usage: {}, custom: [] };
let loadError = false;
function load(): State {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return empty;
    const s = JSON.parse(raw);
    if (!validState(s)) throw Error();
    return s;
  } catch {
    loadError = true;
    return empty;
  }
}
function Mascot() {
  return (
    <svg className="mascot" viewBox="0 0 210 155" aria-hidden="true">
      <path
        d="M34 40q-22-22-12-26M167 30l13-18M182 44l17-4"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <g transform="rotate(9 145 85)">
        <path
          d="M116 34l47-5 18 25-2 76-62 1z"
          fill="#fffdf5"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M116 34l1 24 64-4M142 32l4 24v75"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path d="M119 107q15-15 29 0t30 0v22h-59" fill="#bcdfe5" />
        <circle cx="132" cy="78" r="3" />
        <circle cx="164" cy="77" r="3" />
        <path
          d="M140 86q8 11 15 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
      <path
        d="M65 57Q42 20 27 43q21 23 38 14"
        fill="#87ac60"
        stroke="currentColor"
        strokeWidth="5"
      />
      <path
        d="M65 56q9-37 29-31Q92 53 65 56"
        fill="#87ac60"
        stroke="currentColor"
        strokeWidth="5"
      />
      <path
        d="M47 61q43-25 58 13t-24 60q-23 7-43-4l-13 5 3-16Q9 88 47 61z"
        fill="#ffdb24"
        stroke="currentColor"
        strokeWidth="5"
      />
      <path
        d="M45 88q5-9 10 0m19 0q5-9 10 0M55 103q10 12 20 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="42" cy="100" r="5" fill="#efa34c" />
      <circle cx="87" cy="100" r="5" fill="#efa34c" />
      <path
        d="M27 137l-7 7m79-5 9 6"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function App() {
  const [state, setState] = useState<State>(load),
    [screen, setScreen] = useState<"list" | "add">("list"),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [online, setOnline] = useState(navigator.onLine),
    [error, setError] = useState(
      loadError
        ? "Spremljenu listu nije moguće učitati. Izvorni podaci nisu prebrisani."
        : "",
    ),
    [editor, setEditor] = useState<Product | null>(null),
    [newName, setNewName] = useState(""),
    [newCategory, setNewCategory] = useState("other"),
    [undo, setUndo] = useState<State | null>(null),
    [notice, setNotice] = useState(""),
    [formError, setFormError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null),
    dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);
  useEffect(() => {
    heading.current?.focus();
  }, [screen]);
  useEffect(() => {
    if (editor) {
      dialog.current?.showModal();
      dialog.current?.querySelector("input")?.focus();
    } else dialog.current?.close();
  }, [editor]);
  function commit(next: State) {
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setState(next);
      setUndo(null);
      setError("");
      setNotice("Spremljeno na ovom uređaju");
      return true;
    } catch {
      setError(
        "Spremanje nije uspjelo. Promjena nije spremljena. Provjeri prostor preglednika i pokušaj ponovno.",
      );
      return false;
    }
  }
  const products = [...catalog, ...state.custom],
    active = products.filter((p) => state.items[p.id] === false),
    bought = products.filter((p) => state.items[p.id] === true);
  const frequent = [...products]
    .sort(
      (a, b) =>
        (state.usage[b.id] || 0) - (state.usage[a.id] || 0) ||
        (popular.includes(a.name) ? popular.indexOf(a.name) : 99) -
          (popular.includes(b.name) ? popular.indexOf(b.name) : 99) ||
        a.name.localeCompare(b.name, "hr"),
    )
    .slice(0, 8);
  const filtered = products.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      normalize(p.name).includes(normalize(query)),
  );
  function add(p: Product) {
    if (commit(addProduct(state, p.id)))
      setNotice(
        `${p.name} ${state.items[p.id] === false ? "je već na listi" : "dodano"}`,
      );
  }
  function openEditor(p?: Product) {
    setFormError("");
    setNewName(p?.name || query.trim());
    setNewCategory(p?.category || (category === "all" ? "other" : category));
    setEditor(p || { id: "", name: "", category: "other", custom: true });
  }
  function saveCustom(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim().replace(/\s+/g, " ");
    if (!name) return;
    const duplicate = products.find(
      (p) => p.id !== editor?.id && normalize(p.name) === normalize(name),
    );
    if (duplicate) {
      setFormError(
        `„${duplicate.name}” već postoji u katalogu. Pronađi ga pretraživanjem.`,
      );
      return;
    }
    const p: Product = {
      id: editor?.id || crypto.randomUUID(),
      name,
      category: newCategory,
      custom: true,
    };
    const next = {
      ...state,
      custom: editor?.id
        ? state.custom.map((x) => (x.id === p.id ? p : x))
        : [...state.custom, p],
    };
    if (commit(editor?.id ? next : addProduct(next, p.id))) {
      setEditor(null);
      setQuery("");
    } else {
      setFormError("Spremanje nije uspjelo. Pokušaj ponovno.");
    }
  }
  function productButton(p: Product) {
    const selected = state.items[p.id] === false;
    return (
      <div className="catalog-row" key={p.id}>
        <button
          className={"product-option " + (selected ? "selected" : "")}
          onClick={() => add(p)}
          aria-label={`${selected ? "Već dodano: " : "Dodaj: "}${p.name}`}
        >
          <span>{p.name}</span>
          <span className="mini-check" aria-hidden="true">
            {selected ? "✓" : "+"}
          </span>
        </button>
        {p.custom && (
          <button
            className="edit"
            aria-label={`Uredi ${p.name}`}
            onClick={() => openEditor(p)}
          >
            ✎
          </button>
        )}
      </div>
    );
  }
  function listRow(p: Product, purchased = false) {
    return (
      <div className={"list-row " + (purchased ? "purchased" : "")} key={p.id}>
        <button
          className="item-toggle"
          aria-label={`${purchased ? "Vrati na listu" : "Označi kupljeno"}: ${p.name}`}
          onClick={() =>
            commit({ ...state, items: { ...state.items, [p.id]: !purchased } })
          }
        >
          <span className="check" aria-hidden="true">
            {purchased ? "✓" : ""}
          </span>
          <span>{p.name}</span>
        </button>
        <button
          className="remove"
          aria-label={`Ukloni ${p.name} s liste`}
          onClick={() => commit(removeProduct(state, p.id))}
        >
          ×
        </button>
      </div>
    );
  }
  return (
    <main className="app">
      <header className={screen === "list" ? "hero" : "hero compact"}>
        <div className="eyebrow">MALA LISTA. DOBRA EKIPA.</div>
        <h1 ref={heading} tabIndex={-1}>
          {screen === "list" ? "Naša lista" : "Dodaj namirnice"}
          <span className="title-dot">.</span>
        </h1>
        {screen === "list" ? (
          <>
            <div className="local-badge">
              <span>♧</span> Za nas dvoje
            </div>
            <Mascot />
          </>
        ) : (
          <p>Sve za sljedeću dobru kupovinu.</p>
        )}
      </header>
      <div className="local-note">
        <span className="dot" />
        {online
          ? "Lokalna verzija · još nije povezana s Klarom"
          : "Bez interneta · lokalne promjene ostaju na ovom uređaju"}
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
          <button onClick={() => setError("")} aria-label="Zatvori poruku">
            ×
          </button>
        </div>
      )}
      {screen === "list" ? (
        <section className="content">
          <div className="section-intro">
            <h2>
              {active.length
                ? `${active.length} ${active.length === 1 ? "namirnica" : "namirnica"} za kupiti`
                : "Sve je na svom mjestu."}
            </h2>
            <svg
              className="scribble"
              width="35"
              height="35"
              viewBox="0 0 35 35"
              aria-hidden="true"
            >
              <path
                d="M4 6q24-5 20 22m-9-6 9 7 6-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {!active.length && (
            <div className="empty">
              <img src="/icon.svg" alt="" />
              <h3>{bought.length ? "Sve je kupljeno!" : "Što nam treba?"}</h3>
              <p>
                {bought.length
                  ? "Vrijeme je za nešto fino."
                  : "Dodaj prve namirnice i pripremi se za kupovinu."}
              </p>
              <button className="text-button" onClick={() => setScreen("add")}>
                Otvori katalog →
              </button>
            </div>
          )}
          {categories.map((c) => {
            const rows = active.filter((p) => p.category === c.id);
            return (
              rows.length > 0 && (
                <section className="category-group" key={c.id}>
                  <h3>
                    <span>{c.name}</span>
                  </h3>
                  {rows.map((p) => listRow(p))}
                </section>
              )
            );
          })}
          {bought.length > 0 && (
            <section className="bought">
              <div className="bought-heading">
                <h3>
                  Kupljeno <span>· {bought.length}</span>
                </h3>
                <button
                  onClick={() => {
                    if (commit(clearPurchased(state))) setUndo(state);
                  }}
                >
                  Očisti
                </button>
              </div>
              {bought.map((p) => listRow(p, true))}
            </section>
          )}
          {undo && (
            <div className="undo">
              Kupljene namirnice uklonjene.
              <button
                onClick={() => {
                  const restored = {
                    ...state,
                    items: { ...undo.items, ...state.items },
                  };
                  if (commit(restored)) setUndo(null);
                }}
              >
                Poništi
              </button>
              <button
                aria-label="Zatvori poništavanje"
                onClick={() => setUndo(null)}
              >
                ×
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="content add-content">
          <label className="search">
            <span aria-hidden="true">⌕</span>
            <input
              autoComplete="off"
              type="search"
              placeholder="Pretraži namirnice…"
              aria-label="Pretraži namirnice"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {!query && category === "all" && (
            <section className="frequent">
              <h2>
                Često kupujemo <span>✦</span>
              </h2>
              <p>Mali prečaci za naše velike favorite.</p>
              <div className="frequent-grid">{frequent.map(productButton)}</div>
            </section>
          )}
          <h2 className="catalog-title">
            {query ? "Rezultati pretraživanja" : "Pronađi po kategoriji"}
          </h2>
          <div className="chips" aria-label="Kategorije">
            <button
              className={category === "all" ? "active" : ""}
              onClick={() => setCategory("all")}
            >
              Sve
            </button>
            {categories.map((c) => (
              <button
                aria-pressed={category === c.id}
                className={category === c.id ? "active" : ""}
                key={c.id}
                onClick={() => setCategory(c.id)}
              >
                {c.short}
              </button>
            ))}
          </div>
          <div className="catalog-products">{filtered.map(productButton)}</div>
          {filtered.length === 0 && (
            <p className="no-results">
              {query
                ? `Nema rezultata za „${query}”.`
                : "Ova kategorija još nema namirnica."}
            </p>
          )}
          <button className="new-product" onClick={() => openEditor()}>
            ＋ Dodaj novu namirnicu{query && <span>„{query}”</span>}
          </button>
        </section>
      )}
      <footer>
        <p className="save-status" role="status">
          {notice || "Sprema se samo na ovom uređaju"}
        </p>
        <button
          className="primary"
          onClick={() => {
            setScreen(screen === "list" ? "add" : "list");
            setQuery("");
            setCategory("all");
          }}
        >
          {screen === "list" ? (
            <>
              <span>＋</span> Dodaj namirnice
            </>
          ) : (
            <>
              Gotovo <span>✓</span>
            </>
          )}
        </button>
        {screen === "add" && <small>{active.length} namirnica na listi</small>}
      </footer>
      <dialog
        ref={dialog}
        onCancel={() => setEditor(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setEditor(null);
        }}
      >
        <form onSubmit={saveCustom}>
          <div className="dialog-heading">
            <h2>{editor?.id ? "Uredi namirnicu" : "Nova namirnica"}</h2>
            <button
              type="button"
              aria-label="Zatvori"
              onClick={() => setEditor(null)}
            >
              ×
            </button>
          </div>
          <label>
            Naziv
            <input
              autoFocus
              required
              maxLength={60}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </label>
          <label>
            Kategorija
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <button className="primary" type="submit">
            {editor?.id ? "Spremi promjene" : "Spremi i dodaj"}
          </button>
          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
          {editor?.id && (
            <>
              <button
                className="delete-custom"
                type="button"
                disabled={editor.id in state.items}
                onClick={() => {
                  if (
                    commit({
                      ...state,
                      custom: state.custom.filter((p) => p.id !== editor.id),
                    })
                  )
                    setEditor(null);
                  else setFormError("Spremanje nije uspjelo. Pokušaj ponovno.");
                }}
              >
                Ukloni iz kataloga
              </button>
              {editor.id in state.items && (
                <small>
                  Za uklanjanje iz kataloga prvo ukloni namirnicu s liste.
                </small>
              )}
            </>
          )}
        </form>
      </dialog>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
