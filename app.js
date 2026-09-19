const data = window.BIBLIOTECA_DATA;
const $ = (id) => document.getElementById(id);
const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const normalize = (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const icon = (name) => `<i data-lucide="${name}"></i>`;
const icons = () => { window.lucide?.createIcons(); requestAnimationFrame(fitCovers); };
function fitCovers() {
  const context = document.createElement("canvas").getContext("2d");
  document.querySelectorAll(".cover strong").forEach((title) => {
    if (!title.clientWidth) return;
    context.font = "20px Georgia";
    const longest = Math.max(...title.textContent.split(/\s+/).map((word) => context.measureText(word).width));
    title.style.fontSize = `${Math.min(20, Math.floor(20 * title.clientWidth / longest))}px`;
  });
}
function readList(key) {
  try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value.filter((id) => typeof id === "string") : []; } catch { return []; }
}
let saved = readList("itba-saved");
let downloads = readList("itba-downloads");
let view = "inicio", category = "", selected = null, lastTrigger = null;
const blankFilters = () => ({ query: "", career: "", year: "", term: "", subject: "" });
let applied = blankFilters();
const types = [["", "Todo", "grid-2x2"], ["Resumen", "Resúmenes", "notebook-pen"], ["Parcial", "Parciales", "file-check-2"], ["Bibliografia", "Bibliografía", "book-open"], ["Guia", "Guías", "list-checks"], ["TP", "Trabajos prácticos", "files"]];
function safeURL(value) {
  if (!value || value === "#") return null;
  try { const url = new URL(value, location.href); return ["https:", "http:", "file:"].includes(url.protocol) ? url.href : null; } catch { return null; }
}
const materials = data.materials.filter((item) => safeURL(item.url));
function options(id, values, placeholder) {
  $(id).replaceChildren(new Option(placeholder, ""), ...values.map(([value, label]) => new Option(label, value)));
}
options("career", data.careers.map((career) => [career.id, career.name]), "Todas las carreras");
function fillYears() {
  const careers = data.careers.filter((career) => !$("career").value || career.id === $("career").value);
  const years = [...new Set(careers.flatMap((career) => career.years.map((year) => year.year)))].sort((a,b) => a-b);
  options("year", years.map((year) => [year, `${year}° año`]), "Todos los años"); fillTerms();
}
function fillTerms() {
  options("term", [[1, "1° cuatrimestre"], [2, "2° cuatrimestre"]], "Ambos"); fillSubjects();
}
function fillSubjects() {
  const subjects = data.careers.filter((career) => !$("career").value || career.id === $("career").value)
    .flatMap((career) => career.years.filter((year) => !$("year").value || String(year.year) === $("year").value))
    .flatMap((year) => year.terms.filter((term) => !$("term").value || String(term.term) === $("term").value))
    .flatMap((term) => term.subjects);
  options("subject", [...new Set(subjects)].sort((a,b) => a.localeCompare(b, "es")).map((subject) => [subject, subject]), "Todas las materias");
}
$("career").addEventListener("change", fillYears);
$("year").addEventListener("change", fillTerms);
$("term").addEventListener("change", fillSubjects);
function notify(message) {
  $("toast").textContent = message; $("toast").hidden = false;
  clearTimeout(notify.timer); notify.timer = setTimeout(() => { $("toast").hidden = true; }, 4200);
}
function persist(key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch { notify("Este navegador no permite guardar cambios. Se conservarán mientras la página esté abierta."); }
}
function cover(material) {
  const image = safeURL(material.cover);
  return `<div class="cover ${escapeHTML(normalize(material.type))}">${image ? `<img src="${escapeHTML(image)}" alt="Portada de ${escapeHTML(material.title)}">` : `<span>BIBLIOTECA ITBA · ${escapeHTML(material.type).toUpperCase()}</span><strong>${escapeHTML(material.subject)}</strong>${icon("book-open")}<span>${escapeHTML(material.year)}° AÑO · ${escapeHTML(material.term)}° CUATRIMESTRE</span>`}</div>`;
}
function cards(items) {
  return `<div class="books">${items.map((material) => `<article class="material"><button class="book-button" data-open="${escapeHTML(material.id)}" aria-label="Ver ${escapeHTML(material.title)}">${cover(material)}<h3>${escapeHTML(material.title)}</h3></button><p>${escapeHTML(material.type)} · ${escapeHTML(material.year)}° año</p><button class="save-card ${saved.includes(material.id) ? "saved" : ""}" data-save="${escapeHTML(material.id)}" title="${saved.includes(material.id) ? "Quitar de guardados" : "Guardar"}" aria-label="${saved.includes(material.id) ? "Quitar de guardados" : "Guardar"} ${escapeHTML(material.title)}" aria-pressed="${saved.includes(material.id)}">${icon("bookmark")}</button></article>`).join("")}</div>`;
}
function empty(title, message, name = "book-open", reset = false) {
  return `<div class="empty"><div class="empty-icon">${icon(name)}</div><div><h3>${title}</h3><p>${message}</p>${reset ? `<button class="text-button" data-clear>Limpiar búsqueda ${icon("arrow-right")}</button>` : ""}</div></div>`;
}
function shelf(title, items, emptyTitle, message, type = null) {
  return `<section class="shelf"><div class="shelf-heading"><h2>${title}</h2><button class="text-button" data-category="${type || ""}" data-all>Ver todo ${icon("arrow-up-right")}</button></div>${items.length ? cards(items.slice(0,6)) : empty(emptyTitle, message)}</section>`;
}
function render() {
  document.querySelectorAll("[data-view]").forEach((link) => { link.classList.toggle("active", link.dataset.view === view); if (link.dataset.view === view) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current"); });
  $("saved-count").textContent = materials.filter((material) => saved.includes(material.id)).length;
  const titles = { inicio: ["TU ESPACIO DE ESTUDIO", "¿Qué estudiamos hoy?"], buscar: ["ENCONTRÁ TU MATERIAL", "Buscar en la biblioteca"], descargas: ["TU ACTIVIDAD", "Descargas"], guardados: ["TU BIBLIOTECA PERSONAL", "Guardados"] };
  $("eyebrow").textContent = titles[view][0]; $("page-title").textContent = titles[view][1];
  document.title = `${view === "inicio" ? "Inicio" : titles[view][1]} | Biblioteca ITBA`;
  $("categories").innerHTML = types.map(([value,label,name]) => `<button class="${category === value ? "active" : ""}" data-category="${value}" aria-pressed="${category === value}">${icon(name)}${label}</button>`).join("");
  const results = materials.filter((material) => {
    const career = data.careers.find((item) => item.id === material.careerId);
    const haystack = normalize(`${material.title} ${material.subject} ${material.type} ${career?.name || ""}`);
    return (!category || normalize(material.type) === normalize(category)) && (!applied.query || haystack.includes(normalize(applied.query)))
      && (!applied.career || applied.career === material.careerId) && (!applied.year || applied.year === String(material.year))
      && (!applied.term || applied.term === String(material.term)) && (!applied.subject || applied.subject === material.subject)
      && (view !== "guardados" || saved.includes(material.id)) && (view !== "descargas" || downloads.includes(material.id));
  });
  if (view === "descargas") results.sort((a,b) => downloads.indexOf(a.id) - downloads.indexOf(b.id));
  const filtered = Object.values(applied).some(Boolean) || category;
  if (view === "inicio" && !filtered) {
    $("library-content").innerHTML = shelf("Recién agregados", [...results].reverse(), "La biblioteca está por empezar", "Todavía no hay materiales publicados.")
      + `<div class="section-pair">${shelf("Resúmenes", results.filter((item) => item.type === "Resumen"), "Ideas en pocas páginas", "Aún no hay resúmenes disponibles.", "Resumen")}${shelf("Parciales", results.filter((item) => item.type === "Parcial"), "Tu próximo parcial", "Aún no hay parciales disponibles.", "Parcial")}</div>`
      + shelf("Bibliografía", results.filter((item) => normalize(item.type) === "bibliografia"), "Lecturas para profundizar", "Aún no hay bibliografía disponible.", "Bibliografia");
  } else {
    const title = view === "guardados" ? "Tus materiales guardados" : view === "descargas" ? "Historial de descargas" : "Resultados de búsqueda";
    let message = "Probá con otra materia o con menos filtros.", emptyTitle = "No encontramos materiales";
    if (!filtered && view === "guardados") { emptyTitle = "Tus favoritos, en un lugar"; message = "Todavía no guardaste materiales en este navegador."; }
    if (!filtered && view === "descargas") { emptyTitle = "Todavía no hay descargas"; message = "Tu historial de descargas en este navegador está vacío."; }
    if (!materials.length && view === "buscar") message = "Todavía no hay materiales publicados en la biblioteca.";
    $("library-content").innerHTML = `<section class="shelf"><div class="shelf-heading"><h2>${title}</h2><span>${results.length} archivos</span></div>${results.length ? cards(results) : empty(emptyTitle, message, view === "guardados" ? "bookmark" : view === "descargas" ? "download" : "search", Boolean(filtered))}</section>`;
  }
  icons();
}
function route() {
  const next = location.hash.slice(1);
  view = ["inicio", "buscar", "descargas", "guardados"].includes(next) ? next : "inicio";
  clearFilters();
}
function clearFilters() {
  $("query").value = ""; $("career").value = ""; fillYears();
  applied = blankFilters(); category = ""; render();
}
$("search-form").addEventListener("reset", (event) => { event.preventDefault(); clearFilters(); });
$("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  applied = Object.fromEntries(["query", "career", "year", "term", "subject"].map((key) => [key, $(key).value.trim()]));
  if (view === "inicio") { view = "buscar"; history.pushState(null, "", "#buscar"); }
  render();
});
function showDetails(id, trigger) {
  selected = materials.find((material) => material.id === id); if (!selected) return;
  lastTrigger = trigger; renderDetail(); $("detail").showModal();
}
function renderDetail() {
  const material = selected;
  const career = data.careers.find((item) => item.id === material.careerId);
  const report = new URL("https://github.com/gaelstella/biblioteca-virtual-itba/issues/new");
  report.searchParams.set("title", `Reporte: ${material.title}`);
  report.searchParams.set("body", `Material: ${material.title}\nID: ${material.id}\n\nMotivo del reporte:\n`);
  $("detail-body").innerHTML = `<div class="detail-heading"><span>DETALLE DEL MATERIAL</span><button class="icon-button" data-close aria-label="Cerrar detalle" title="Cerrar">${icon("x")}</button></div><div class="detail-cover">${cover(material)}</div><h2 class="detail-title" id="detail-title">${escapeHTML(material.title)}</h2><p class="detail-subject">${escapeHTML(material.subject)}</p><a class="primary open-file" href="${escapeHTML(safeURL(material.url))}" target="_blank" rel="noopener">${icon("external-link")}Abrir archivo</a><div class="detail-actions"><button data-download>${icon("download")}Descargar</button><button data-save="${escapeHTML(material.id)}" class="${saved.includes(material.id) ? "saved" : ""}" aria-pressed="${saved.includes(material.id)}">${icon("bookmark")}${saved.includes(material.id) ? "Guardado" : "Guardar"}</button><a href="${escapeHTML(report.href)}" target="_blank" rel="noopener">${icon("flag")}Reportar</a></div><dl><div><dt>Tipo</dt><dd>${escapeHTML(material.type)}</dd></div><div><dt>Carrera</dt><dd>${escapeHTML(career?.name || "")}</dd></div><div><dt>Año</dt><dd>${escapeHTML(material.year)}° año</dd></div><div><dt>Cuatrimestre</dt><dd>${escapeHTML(material.term)}° cuatrimestre</dd></div><div><dt>Materia</dt><dd>${escapeHTML(material.subject)}</dd></div></dl><p class="detail-note">Guardados e historial se conservan en este navegador. Los reportes se envían desde tu cuenta de GitHub.</p>`;
  icons();
}
async function downloadMaterial(button) {
  const material = selected; button.disabled = true;
  try {
    const response = await fetch(safeURL(material.url));
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob(); const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url;
    link.download = new URL(safeURL(material.url)).pathname.split("/").pop() || material.title;
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
    downloads = [material.id, ...downloads.filter((id) => id !== material.id)]; persist("itba-downloads", downloads); render(); notify("Descarga iniciada.");
  } catch { notify("No pudimos descargarlo. Abrí el archivo para descargarlo desde su sitio de origen."); }
  finally { button.disabled = false; }
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("button"); if (!button) return;
  if (button.hasAttribute("data-category")) {
    category = button.dataset.category;
    if (button.hasAttribute("data-all")) { view = "buscar"; history.pushState(null, "", "#buscar"); }
    render();
  }
  if (button.hasAttribute("data-open")) showDetails(button.dataset.open, button);
  if (button.hasAttribute("data-close")) $("detail").close();
  if (button.hasAttribute("data-clear")) clearFilters();
  if (button.hasAttribute("data-save")) {
    const id = button.dataset.save; const wasSaved = saved.includes(id);
    saved = wasSaved ? saved.filter((item) => item !== id) : [...saved, id]; persist("itba-saved", saved); render();
    if ($("detail").open) { renderDetail(); $("detail").querySelector("[data-save]").focus(); }
    else document.querySelector(`[data-save="${CSS.escape(id)}"]`)?.focus();
    notify(wasSaved ? "Material quitado de guardados." : "Material guardado.");
  }
  if (button.hasAttribute("data-download")) downloadMaterial(button);
});
$("detail").addEventListener("click", (event) => { if (event.target === $("detail") && event.clientX < $("detail").getBoundingClientRect().left) $("detail").close(); });
$("detail").addEventListener("close", () => { if (lastTrigger?.isConnected) lastTrigger.focus(); else document.querySelector(".sidebar .active")?.focus(); });
window.addEventListener("hashchange", route);
new ResizeObserver(() => requestAnimationFrame(fitCovers)).observe(document.querySelector("main"));
fillYears(); route();
