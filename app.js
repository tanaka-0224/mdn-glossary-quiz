import { glossary } from "./data/glossary.js";

const $ = (id) => document.getElementById(id);
const state = {
  mode: "definition",
  pending: [...glossary],
  mastered: [],
  current: null,
  flipped: false,
  search: ""
};
const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
function chooseNext() {
  if (!state.pending.length) {
    state.current = null;
    render();
    return;
  }
  state.current = state.pending[Math.floor(Math.random() * state.pending.length)];
  state.flipped = false;
  render();
}
function render() {
  $("remaining").textContent = state.pending.length;
  $("mastered").textContent = state.mastered.length;
  $("total-count").textContent = `(${glossary.length})`;
  $("progress").style.width = `${glossary.length ? state.mastered.length / glossary.length * 100 : 0}%`;
  $("study").hidden = !state.current;
  $("empty").hidden = !!state.current;
  if (state.current) {
    const isFront = !state.flipped;
    const showDefinition = state.mode === "definition" ? isFront : !isFront;
    $("card-label").textContent = showDefinition ? "DEFINITION" : "TERM";
    $("card-content").textContent = showDefinition ? state.current.definition : state.current.term;
    $("flip-hint").textContent = isFront ? "タップして答えを見る" : "タップして表に戻る";
    $("counter").textContent = `${state.pending.length} TERMS LEFT`;
    $("direction").textContent = state.mode === "definition" ? "説明 → 用語" : "用語 → 説明";
    $("known").disabled = !state.flipped;
    $("unknown").disabled = !state.flipped;
    $("flashcard").setAttribute("aria-label", isFront ? "答えを見る" : "表に戻る");
  }
  renderList();
}
function renderList() {
  const query = $("list-search").value.trim().toLowerCase();
  const filtered = [...state.pending.map(x=>({...x,done:false})),...state.mastered.map(x=>({...x,done:true}))]
    .filter(x => !query || `${x.term} ${x.original}`.toLowerCase().includes(query));
  $("term-list").innerHTML = filtered.map(x =>
    `<div class="term-row ${x.done ? "mastered" : ""}"><span>${escapeHtml(x.term)} <small>${escapeHtml(x.original)}</small></span><small>${x.done ? "習得済み" : "未習得"}</small></div>`
  ).join("");
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
$("flashcard").addEventListener("click", () => { if (!state.current) return; state.flipped = !state.flipped; render(); });
$("known").addEventListener("click", () => {
  if (!state.current || !state.flipped) return;
  state.pending = state.pending.filter(x => x.id !== state.current.id);
  state.mastered.push(state.current);
  chooseNext();
});
$("unknown").addEventListener("click", () => { if (state.current && state.flipped) chooseNext(); });
document.querySelectorAll(".mode").forEach(button => button.addEventListener("click", () => {
  state.mode = button.dataset.mode;
  document.querySelectorAll(".mode").forEach(b => b.classList.toggle("active", b === button));
  state.flipped = false;
  render();
}));
$("list-search").addEventListener("input", renderList);
$("search").addEventListener("input", e => {
  state.search = e.target.value.trim().toLowerCase();
  const matches = glossary.filter(x => `${x.term} ${x.original}`.toLowerCase().includes(state.search));
  $("list-search").value = state.search;
  $("term-list").innerHTML = matches.map(x => {
    const done = state.mastered.some(m=>m.id===x.id);
    return `<div class="term-row ${done ? "mastered" : ""}"><span>${escapeHtml(x.term)} <small>${escapeHtml(x.original)}</small></span><small>${done ? "習得済み" : "未習得"}</small></div>`;
  }).join("");
  document.querySelector(".list-section details").open = true;
});
$("restart").addEventListener("click", () => { state.pending = shuffle(glossary); state.mastered = []; chooseNext(); });
$("settings-button").addEventListener("click", () => $("settings").showModal());
chooseNext();