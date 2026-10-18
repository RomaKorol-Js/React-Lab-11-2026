import { openDetails } from './details.js';
import { toggle, watchlist } from './state.js';

/**
 * C2. Підключає кнопки карток у списку #results: «До списку» додає серіал до мого списку або
 * прибирає з нього, «Детальніше» відкриває діалог (openDetails з details.js). main.js викликає
 * цю функцію один раз, після першого показу списку. Специфікація — ТЗ, C2.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initList(refresh) {
  const results = document.querySelector('#results');
  const count = document.querySelector('#watchlist-count');

  if (!(results instanceof HTMLUListElement)) throw new TypeError('Не знайдено список #results');
  if (!(count instanceof HTMLElement)) throw new TypeError('Не знайдено лічильник #watchlist-count');

  count.textContent = String(watchlist.size);

  results.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest('button[data-action]');
    const card = button?.closest('li[data-id]');
    if (!button || !card || !results.contains(button)) return;

    const id = Number(card.dataset.id);
    if (!Number.isInteger(id)) throw new TypeError(`Некоректний id серіалу: ${card.dataset.id}`);

    if (button.dataset.action === 'toggle') {
      const cards = [...results.querySelectorAll(':scope > li[data-id]')];
      const index = cards.indexOf(card);
      toggle(id);
      count.textContent = String(watchlist.size);
      refresh();
      const updatedButton = results.querySelector(`[data-id="${id}"] [data-action="toggle"]`);
      if (updatedButton) {
        updatedButton.focus();
        return;
      }

      const nextButton = cards
        .slice(index + 1)
        .map((item) => results.querySelector(`[data-id="${item.dataset.id}"] [data-action="toggle"]`))
        .find((item) => item instanceof HTMLButtonElement);
      const previousButton = cards
        .slice(0, index)
        .reverse()
        .map((item) => results.querySelector(`[data-id="${item.dataset.id}"] [data-action="toggle"]`))
        .find((item) => item instanceof HTMLButtonElement);
      const heading = document.querySelector('#results-heading');

      if (nextButton instanceof HTMLButtonElement) {
        nextButton.focus();
      } else if (previousButton instanceof HTMLButtonElement) {
        previousButton.focus();
      } else if (heading instanceof HTMLElement) {
        heading.tabIndex = -1;
        heading.focus();
      }
    } else if (button.dataset.action === 'details') {
      openDetails(id);
    }
  });
}
