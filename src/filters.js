/** @typedef {import('./state.js').Filters} Filters */

/**
 * C3. Повертає поточні значення форми фільтрів #filters. Поки C3 не виконано, фільтрів немає,
 * і список показує всі серіали. Специфікація — ТЗ, C3.
 *
 * @returns {Filters}
 */
export function readFilters() {
  const form = document.querySelector("#filters");
  if (!(form instanceof HTMLFormElement))
    throw new TypeError("Не знайдено форму #filters");

  const query = form.elements.namedItem("query");
  const genre = form.elements.namedItem("genre");
  const mine = form.elements.namedItem("mine");
  if (!(query instanceof HTMLInputElement))
    throw new TypeError("Не знайдено поле пошуку query");
  if (!(genre instanceof HTMLSelectElement))
    throw new TypeError("Не знайдено поле жанру genre");
  if (!(mine instanceof HTMLInputElement))
    throw new TypeError("Не знайдено перемикач mine");

  return { query: query.value, genre: genre.value, mine: mine.checked };
}

/**
 * C3. Підключає форму фільтрів: після кожної зміни — refresh(). main.js викликає цю функцію
 * один раз. Специфікація — ТЗ, C3.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initFilters(refresh) {
  const form = document.querySelector("#filters");
  if (!(form instanceof HTMLFormElement))
    throw new TypeError("Не знайдено форму #filters");

  const query = form.elements.namedItem("query");
  const genre = form.elements.namedItem("genre");
  const mine = form.elements.namedItem("mine");
  form.addEventListener("input", (event) => {
    if (
      event.target instanceof HTMLInputElement &&
      event.target.name === "query"
    )
      refresh();
  });
  form.addEventListener("change", (event) => {
    if (
      (event.target instanceof HTMLSelectElement &&
        event.target.name === "genre") ||
      (event.target instanceof HTMLInputElement && event.target.name === "mine")
    ) {
      refresh();
    }
  });
  const resetButton = form.querySelector(
    'button[type="reset"], input[type="reset"]',
  );
  resetButton?.addEventListener("click", () => {
    query.value = "";
    genre.value = "";
    mine.checked = false;
    refresh();
  });
  form.addEventListener("submit", (event) => event.preventDefault());
}
