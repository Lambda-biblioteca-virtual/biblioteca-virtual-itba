const data = window.BIBLIOTECA_DATA;
const careerButtons = document.querySelector("#career-buttons");
const selectedCareer = document.querySelector("#selected-career");
const planLink = document.querySelector("#plan-link");
const curriculum = document.querySelector("#curriculum");
const searchInput = document.querySelector("#global-search");
const clearSearch = document.querySelector("#clear-search");
const filterCareer = document.querySelector("#filter-career");
const filterYear = document.querySelector("#filter-year");
const filterType = document.querySelector("#filter-type");
const materialsList = document.querySelector("#materials-list");

let currentCareerId = data.careers[0].id;

function normalize(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function renderCareerButtons() {
  careerButtons.innerHTML = data.careers.map((career) => `
    <button class="career-button ${career.id === currentCareerId ? "active" : ""}" data-career="${career.id}">
      ${career.name}
    </button>
  `).join("");
}

function renderCurriculum() {
  const career = data.careers.find((item) => item.id === currentCareerId);
  const query = normalize(searchInput.value.trim());
  selectedCareer.textContent = career.name;
  planLink.href = career.plan;

  curriculum.innerHTML = career.years.map((year) => {
    const terms = year.terms.map((term) => {
      const subjects = term.subjects
        .filter((subject) => !query || normalize(`${career.name} ${subject}`).includes(query))
        .map((subject) => `<li>${subject}</li>`)
        .join("");

      if (!subjects && query) return "";

      return `
        <div class="term-card">
          <h4>${term.term}° cuatrimestre</h4>
          <ul>${subjects}</ul>
        </div>
      `;
    }).join("");

    if (!terms && query) return "";

    return `
      <article class="year-block">
        <h3>${year.year}° año</h3>
        <div class="term-grid">${terms}</div>
      </article>
    `;
  }).join("") || `<p class="empty">No encontramos materias con esa busqueda en esta carrera.</p>`;
}

function renderFilters() {
  filterCareer.innerHTML = `<option value="">Todas</option>` + data.careers.map((career) => (
    `<option value="${career.id}">${career.name}</option>`
  )).join("");
}

function renderMaterials() {
  const query = normalize(searchInput.value.trim());
  const career = filterCareer.value;
  const year = filterYear.value;
  const type = filterType.value;

  const results = data.materials.filter((material) => {
    const careerName = data.careers.find((item) => item.id === material.careerId)?.name || "";
    const text = normalize(`${careerName} ${material.subject} ${material.type} ${material.title}`);
    return (!query || text.includes(query))
      && (!career || material.careerId === career)
      && (!year || String(material.year) === year)
      && (!type || material.type === type);
  });

  materialsList.innerHTML = results.map((material) => {
    const careerName = data.careers.find((item) => item.id === material.careerId)?.name || "";
    return `
      <article class="material-card">
        <span class="tag">${material.type}</span>
        <h3>${material.title}</h3>
        <p>${careerName} / ${material.year}° año / ${material.term}° cuatrimestre / ${material.subject}</p>
        <a href="${material.url}">${material.status || "Abrir material"}</a>
      </article>
    `;
  }).join("") || `<p class="empty">Todavia no hay materiales cargados para esos filtros.</p>`;
}

careerButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-career]");
  if (!button) return;
  currentCareerId = button.dataset.career;
  renderCareerButtons();
  renderCurriculum();
});

[searchInput, filterCareer, filterYear, filterType].forEach((control) => {
  control.addEventListener("input", () => {
    renderCurriculum();
    renderMaterials();
  });
});

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  renderCurriculum();
  renderMaterials();
});

renderCareerButtons();
renderCurriculum();
renderFilters();
renderMaterials();
