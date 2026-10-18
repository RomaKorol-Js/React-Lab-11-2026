/** @typedef {import('./state.js').Show} Show */
import { notes, shows, watchlist } from './state.js';

/**
 * C1. Показує серіали в списку #results — по картці з шаблону #show-card на кожен, у тому
 * самому порядку, — і оновлює рядок статусу #status. Специфікація — ТЗ, C1.
 *
 * @param {readonly Show[]} list серіали, які треба показати
 */
export function renderShows(list) {
  const results = document.querySelector('#results');
  const status = document.querySelector('#status');
  const template = document.querySelector('#show-card');

  if (!(results instanceof HTMLUListElement)) throw new TypeError('Не знайдено список #results');
  if (!(status instanceof HTMLElement)) throw new TypeError('Не знайдено рядок статусу #status');
  if (!(template instanceof HTMLTemplateElement)) throw new TypeError('Не знайдено шаблон #show-card');

  const fragment = document.createDocumentFragment();

  for (const show of list) {
    const card = template.content.firstElementChild?.cloneNode(true);
    if (!(card instanceof HTMLLIElement)) throw new TypeError('Шаблон #show-card має містити елемент <li>');

    card.dataset.id = String(show.id);
    card.querySelectorAll('[data-field="name"]').forEach((field) => {
      field.textContent = show.name;
    });
    const year = card.querySelector('[data-field="year"]');
    const genres = card.querySelector('[data-field="genres"]');
    const rating = card.querySelector('[data-field="rating"]');
    if (!year || !genres || !rating) throw new TypeError('У шаблоні #show-card бракує полів серіалу');

    year.textContent = String(show.year ?? '—');
    genres.textContent = show.genres.length ? show.genres.join(', ') : '—';
    rating.textContent = String(show.rating ?? '—');

    const toggleButton = card.querySelector('[data-action="toggle"]');
    if (!(toggleButton instanceof HTMLButtonElement)) {
      throw new TypeError('У шаблоні #show-card немає кнопки [data-action="toggle"]');
    }
    toggleButton.setAttribute('aria-pressed', String(watchlist.has(show.id)));

    const note = notes.get(show.id);
    const myRating = card.querySelector('[data-field="my-rating"]');
    const myRatingRow = card.querySelector('.card__mine');
    const noteText = card.querySelector('[data-field="note"]');
    if (!myRating || !myRatingRow || !noteText) {
      throw new TypeError('У шаблоні #show-card бракує полів нотатки');
    }
    myRating.textContent = note ? String(note.rating) : '';
    myRatingRow.toggleAttribute('hidden', !note);
    noteText.textContent = note?.text ?? '';
    noteText.toggleAttribute('hidden', !note?.text);

    fragment.append(card);
  }

  results.replaceChildren(fragment);
  status.textContent = list.length
    ? `Знайдено: ${list.length} з ${shows.length}`
    : 'Нічого не знайдено';
}
