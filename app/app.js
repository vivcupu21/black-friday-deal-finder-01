// DealHound — renders the deal finder, filters and verdicts.
// No network calls: everything on this page comes from deals.js.
import { DEALS, META } from "./deals.js";

const grid = document.getElementById("grid");
const statsEl = document.getElementById("stats");
const countEl = document.getElementById("resultCount");
const searchEl = document.getElementById("search");
const categoryEl = document.getElementById("category");
const storeEl = document.getElementById("store");
const minDiscountEl = document.getElementById("minDiscount");
const sortEl = document.getElementById("sort");

function money(n) {
  return "$" + n.toFixed(2).replace(/\.00$/, "");
}

function discountPct(d) {
  return Math.round((1 - d.sale / d.usual) * 100);
}

function verdictOf(d) {
  const pct = discountPct(d);
  if (pct >= 40 || d.recordLow) {
    return { label: "REAL DEAL", cls: "real" };
  }
  if (pct >= 20) return { label: "Solid deal", cls: "solid" };
  return { label: "Modest cut", cls: "modest" };
}

function checkedLabel(iso) {
  const dt = new Date(iso);
  return dt.toLocaleString("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }) + " WIB";
}

function unique(values) {
  return [...new Set(values)].sort();
}

function fillSelect(el, values, allLabel) {
  el.innerHTML = "";
  const all = document.createElement("option");
  all.value = "";
  all.textContent = allLabel;
  el.appendChild(all);
  for (const v of values) {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    el.appendChild(opt);
  }
}

function cardHtml(d) {
  const pct = discountPct(d);
  const verdict = verdictOf(d);
  const saved = d.usual - d.sale;
  return `<article class="card">
    <div class="card-top"><span class="store-tag">${d.store}</span><span class="category-tag">${d.category}</span></div>
    <h2>${d.product}</h2>
    <div class="price-row">
      <span class="sale-price">${money(d.sale)}</span>
      <span class="usual-price">${money(d.usual)}</span>
      <span class="save">Save ${money(saved)} (${pct}% off)</span>
    </div>
    <span class="verdict verdict-${verdict.cls}">${verdict.label}</span>
    <p class="note">${d.note}</p>
    <p class="meta">Checked ${checkedLabel(d.checkedAt)} · Source: <a href="${d.sourceUrl}" target="_blank" rel="noopener">${d.source}</a></p>
    <a class="store-link" href="${d.url}" target="_blank" rel="noopener">View at ${d.store} &#8599;</a>
  </article>`;
}

function readHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  return {
    q: params.get("q") || "",
    category: params.get("category") || "",
    store: params.get("store") || "",
    min: params.get("min") || "0",
    sort: params.get("sort") || "discount",
  };
}

function writeHash() {
  const params = new URLSearchParams();
  if (searchEl.value) params.set("q", searchEl.value);
  if (categoryEl.value) params.set("category", categoryEl.value);
  if (storeEl.value) params.set("store", storeEl.value);
  if (minDiscountEl.value !== "0") params.set("min", minDiscountEl.value);
  if (sortEl.value !== "discount") params.set("sort", sortEl.value);
  const next = params.toString();
  history.replaceState(null, "", next ? "#" + next : location.pathname);
}

function visibleDeals() {
  const q = searchEl.value.trim().toLowerCase();
  const min = Number(minDiscountEl.value);
  let list = DEALS.filter((d) => {
    if (categoryEl.value && d.category !== categoryEl.value) return false;
    if (storeEl.value && d.store !== storeEl.value) return false;
    if (discountPct(d) < min) return false;
    if (q) {
      const hay = (d.product + " " + d.store + " " + d.category).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const sort = sortEl.value;
  if (sort === "discount") list.sort((a, b) => discountPct(b) - discountPct(a));
  if (sort === "price-asc") list.sort((a, b) => a.sale - b.sale);
  if (sort === "price-desc") list.sort((a, b) => b.sale - a.sale);
  if (sort === "name") list.sort((a, b) => a.product.localeCompare(b.product));
  return list;
}

function render() {
  const list = visibleDeals();
  countEl.textContent = list.length === DEALS.length
    ? `Showing all ${list.length} verified deals`
    : `Showing ${list.length} of ${DEALS.length} verified deals`;
  grid.innerHTML = list.length
    ? list.map(cardHtml).join("")
    : `<p class="empty">No deals match those filters. Try clearing the search or lowering the minimum discount.</p>`;
}

function renderStats() {
  const stores = unique(DEALS.map((d) => d.store)).length;
  const best = Math.max(...DEALS.map(discountPct));
  const real = DEALS.filter((d) => verdictOf(d).cls === "real").length;
  statsEl.innerHTML = `
    <div class="stat"><b>${DEALS.length}</b><span>verified deals</span></div>
    <div class="stat"><b>${stores}</b><span>stores</span></div>
    <div class="stat"><b>${best}%</b><span>biggest cut</span></div>
    <div class="stat"><b>${real}</b><span>real deals</span></div>
    <div class="stat"><b>${META.checkedDay}</b><span>prices checked</span></div>`;
}

fillSelect(categoryEl, unique(DEALS.map((d) => d.category)), "All categories");
fillSelect(storeEl, unique(DEALS.map((d) => d.store)), "All stores");

const initial = readHash();
searchEl.value = initial.q;
categoryEl.value = initial.category;
storeEl.value = initial.store;
minDiscountEl.value = initial.min;
sortEl.value = initial.sort;

for (const el of [searchEl, categoryEl, storeEl, minDiscountEl, sortEl]) {
  el.addEventListener("input", () => { writeHash(); render(); });
}

renderStats();
render();
