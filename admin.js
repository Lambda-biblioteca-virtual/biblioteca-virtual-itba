const data = window.BIBLIOTECA_DATA;
const careerSelect = document.querySelector("#admin-career");
const yearSelect = document.querySelector("#admin-year");
const termSelect = document.querySelector("#admin-term");
const subjectSelect = document.querySelector("#admin-subject");
const form = document.querySelector("#admin-form");
const output = document.querySelector("#admin-output");
const message = document.querySelector("#admin-message");

function fillCareers() {
  careerSelect.innerHTML = data.careers.map((career) => (
    `<option value="${career.id}">${career.name}</option>`
  )).join("");
}

function fillSubjects() {
  const career = data.careers.find((item) => item.id === careerSelect.value);
  const year = Number(yearSelect.value);
  const term = Number(termSelect.value);
  const subjects = career?.years
    .find((item) => item.year === year)?.terms
    .find((item) => item.term === term)?.subjects || [];

  subjectSelect.innerHTML = subjects.map((subject) => (
    `<option>${subject}</option>`
  )).join("") || `<option>Materia a revisar</option>`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (document.querySelector("#admin-key").value !== "itba-admin") {
    message.textContent = "Clave incorrecta. Usa la clave temporal indicada.";
    output.textContent = "";
    return;
  }

  const entry = {
    id: `${careerSelect.value}-${Date.now()}`,
    careerId: careerSelect.value,
    year: Number(yearSelect.value),
    term: Number(termSelect.value),
    subject: subjectSelect.value,
    type: document.querySelector("#admin-type").value,
    title: document.querySelector("#admin-title").value,
    url: document.querySelector("#admin-url").value,
    status: "Abrir material"
  };

  message.textContent = "Entrada generada. Esta ficha se agrega al archivo data.js para publicarla.";
  output.textContent = JSON.stringify(entry, null, 2);
});

[careerSelect, yearSelect, termSelect].forEach((control) => {
  control.addEventListener("change", fillSubjects);
});

fillCareers();
fillSubjects();
