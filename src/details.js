import { getShow, notes, saveNote } from './state.js';

let activeShowId;
let opener;

function clearRatingError(rating, error) {
  rating.removeAttribute('aria-invalid');
  const describedBy = (rating.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .filter((id) => id && id !== error.id);
  if (describedBy.length) {
    rating.setAttribute('aria-describedby', describedBy.join(' '));
  } else {
    rating.removeAttribute('aria-describedby');
  }
  error.textContent = '';
}

function showRatingError(rating, error) {
  rating.setAttribute('aria-invalid', 'true');
  const describedBy = new Set((rating.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean));
  describedBy.add(error.id);
  rating.setAttribute('aria-describedby', [...describedBy].join(' '));
  error.textContent = 'Введіть ціле число від 1 до 10.';
}

function validRating(rating) {
  const value = rating.valueAsNumber;
  return rating.value !== '' && Number.isInteger(value) && value >= 1 && value <= 10;
}

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
  const form = document.querySelector('#note-form');
  const rating = document.querySelector('#note-rating');
  const noteText = document.querySelector('#note-text');
  const error = document.querySelector('#note-rating-error');
  if (!(dialog instanceof HTMLDialogElement)) throw new TypeError('Не знайдено діалог #details');
  if (!(title instanceof HTMLElement)) throw new TypeError('Не знайдено заголовок #details-title');
  if (!(summary instanceof HTMLElement)) throw new TypeError('Не знайдено опис #details-summary');
  if (!(link instanceof HTMLAnchorElement)) throw new TypeError('Не знайдено посилання #details-link');
  if (!(form instanceof HTMLFormElement)) throw new TypeError('Не знайдено форму #note-form');
  if (!(rating instanceof HTMLInputElement)) throw new TypeError('Не знайдено поле #note-rating');
  if (!(noteText instanceof HTMLTextAreaElement)) throw new TypeError('Не знайдено поле #note-text');
  if (!(error instanceof HTMLElement)) throw new TypeError('Не знайдено помилку #note-rating-error');

  const show = getShow(id);
  activeShowId = id;
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

  const savedNote = notes.get(id);
  rating.value = savedNote ? String(savedNote.rating) : '';
  noteText.value = savedNote?.text ?? '';
  clearRatingError(rating, error);
  form.noValidate = true;

  if (!dialog.open) {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
  }
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

  dialog.addEventListener('close', () => {
    if (opener?.isConnected) opener.focus();
    opener = null;
  });
  cancel.addEventListener('click', () => dialog.close());

  const form = dialog.querySelector('#note-form');
  const rating = dialog.querySelector('#note-rating');
  const noteText = dialog.querySelector('#note-text');
  const error = dialog.querySelector('#note-rating-error');
  if (!(form instanceof HTMLFormElement)) throw new TypeError('Не знайдено форму #note-form');
  if (!(rating instanceof HTMLInputElement)) throw new TypeError('Не знайдено поле #note-rating');
  if (!(noteText instanceof HTMLTextAreaElement)) throw new TypeError('Не знайдено поле #note-text');
  if (!(error instanceof HTMLElement)) throw new TypeError('Не знайдено помилку #note-rating-error');

  rating.addEventListener('input', () => {
    if (validRating(rating)) clearRatingError(rating, error);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!validRating(rating)) {
      showRatingError(rating, error);
      rating.focus();
      return;
    }
    if (activeShowId === undefined) throw new Error('Не вибрано серіал для нотатки');

    const show = getShow(activeShowId);
    saveNote(activeShowId, { rating: rating.valueAsNumber, text: noteText.value });
    dialog.close();
    refresh();

    const status = document.querySelector('#status');
    const detailsButton = document.querySelector(
      `#results li[data-id="${activeShowId}"] [data-action="details"]`,
    );
    if (!(status instanceof HTMLElement)) throw new TypeError('Не знайдено рядок статусу #status');
    status.textContent = `Нотатку до ${show.name} збережено`;
    if (detailsButton instanceof HTMLButtonElement) {
      detailsButton.focus();
    } else {
      const heading = document.querySelector('#results-heading');
      if (heading instanceof HTMLElement) {
        heading.tabIndex = -1;
        heading.focus();
      }
    }
  });
}
