import { getShow } from './state.js';

/**
 * C4. Відкриває діалог #details для серіалу: назва, опис, посилання на сторінку TVmaze і форма
 * з моєю оцінкою й нотаткою. Специфікація — ТЗ, C4.
 *
 * @param {number} id
 */
export function openDetails(id) {
  const dialog = document.querySelector('#details');
  const title = document.querySelector('#details-title');
  const summary = document.querySelector('#details-summary');
  const link = document.querySelector('#details-link');
  if (!(dialog instanceof HTMLDialogElement)) throw new TypeError('Не знайдено діалог #details');
  if (!(title instanceof HTMLElement)) throw new TypeError('Не знайдено заголовок #details-title');
  if (!(summary instanceof HTMLElement)) throw new TypeError('Не знайдено опис #details-summary');
  if (!(link instanceof HTMLAnchorElement)) throw new TypeError('Не знайдено посилання #details-link');

  const show = getShow(id);
  title.textContent = show.name;
  link.href = show.url;

  const parsedSummary = new DOMParser().parseFromString(show.summary, 'text/html');
  const paragraphs = [...parsedSummary.body.children].map((paragraph) => {
    const element = document.createElement('p');
    element.textContent = paragraph.textContent ?? '';
    return element;
  });
  if (paragraphs.length) {
    summary.replaceChildren(...paragraphs);
  } else {
    summary.textContent = parsedSummary.body.textContent ?? '';
  }

  if (!dialog.open) dialog.showModal();
}

/**
 * C4. Підключає діалог #details: закриття й форму «Моя оцінка й нотатка». main.js викликає цю
 * функцію один раз. Специфікація — ТЗ, C4.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initDetails(refresh) {
  const dialog = document.querySelector('#details');
  const cancel = dialog?.querySelector('button[type="button"]');
  if (!(dialog instanceof HTMLDialogElement)) throw new TypeError('Не знайдено діалог #details');
  if (!(cancel instanceof HTMLButtonElement)) throw new TypeError('Не знайдено кнопку скасування в діалозі');

  cancel.addEventListener('click', () => dialog.close());

  const form = dialog.querySelector('#note-form');
  if (!(form instanceof HTMLFormElement)) throw new TypeError('Не знайдено форму #note-form');
  form.addEventListener('submit', (event) => event.preventDefault());
}
