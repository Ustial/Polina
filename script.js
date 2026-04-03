const compliments = Array.isArray(window.COMPLIMENTS) ? window.COMPLIMENTS : [];
const photos = Array.isArray(window.PHOTOS) ? window.PHOTOS : [];

const mainPhoto = document.getElementById('mainPhoto');
const nextPhoto = document.getElementById('nextPhoto');
const frontText = document.getElementById('complimentTextFront');
const backText = document.getElementById('complimentTextBack');
const flipCardInner = document.getElementById('flipCardInner');
const moreButton = document.getElementById('moreButton');

const PHOTO_SHRINK_MS = 90;
const PHOTO_GROW_MS = 130;
const FLIP_DURATION_MS = 420;

let currentComplimentIndex = 0;
let currentPhotoIndex = 0;
let isAnimating = false;

function safeTextFromList(list, index, fallback) {
  return list[index] ?? fallback;
}

function normalizePhoto(item) {
  if (!item) {
    return { src: 'assets/images/photos/1.png', alt: 'Фото' };
  }

  if (typeof item === 'string') {
    return { src: item, alt: 'Фото' };
  }

  return {
    src: item.src || 'assets/images/photos/1.png',
    alt: item.alt || 'Фото'
  };
}

function pickDifferentIndex(list, currentIndex) {
  if (!Array.isArray(list) || list.length === 0) return 0;
  if (list.length === 1) return 0;

  let nextIndex = currentIndex;
  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * list.length);
  }
  return nextIndex;
}

function applyCompliment(index) {
  const text = safeTextFromList(
    compliments,
    index,
    'Ты выглядишь как человек, который умеет превращать обычный день в хороший.'
  );
  frontText.textContent = text;
  backText.textContent = text;
}

function applyPhoto(index) {
  const photo = normalizePhoto(photos[index]);
  mainPhoto.src = photo.src;
  mainPhoto.alt = photo.alt;
}

function initializeContent() {
  if (compliments.length > 0) {
    currentComplimentIndex = 0;
  }

  if (photos.length > 0) {
    currentPhotoIndex = 0;
  }

  applyCompliment(currentComplimentIndex);
  applyPhoto(currentPhotoIndex);
}

function setPressedState(isPressed) {
  moreButton.classList.toggle('is-pressed', isPressed);
}

function clearPressedState() {
  setPressedState(false);
}

function runPhotoSwap(nextPhotoData) {
  mainPhoto.classList.add('is-shrinking');

  window.setTimeout(() => {
    mainPhoto.src = nextPhotoData.src;
    mainPhoto.alt = nextPhotoData.alt;
    mainPhoto.classList.remove('is-shrinking');
    mainPhoto.classList.add('is-growing');

    window.setTimeout(() => {
      mainPhoto.classList.remove('is-growing');
    }, PHOTO_GROW_MS);
  }, PHOTO_SHRINK_MS);
}

function swapToNext() {
  if (isAnimating) return;
  isAnimating = true;
  moreButton.disabled = true;

  const nextComplimentIndex = pickDifferentIndex(compliments, currentComplimentIndex);
  const nextPhotoIndex = pickDifferentIndex(photos, currentPhotoIndex);

  const nextCompliment = safeTextFromList(
    compliments,
    nextComplimentIndex,
    'У тебя есть редкий дар: делать пространство спокойнее одним своим присутствием.'
  );

  const nextPhotoData = normalizePhoto(photos[nextPhotoIndex]);

  backText.textContent = nextCompliment;
  flipCardInner.classList.add('is-flipping');
  runPhotoSwap(nextPhotoData);

  window.setTimeout(() => {
    frontText.textContent = nextCompliment;
    currentComplimentIndex = nextComplimentIndex;
    currentPhotoIndex = nextPhotoIndex;

    flipCardInner.classList.add('no-transition');
    flipCardInner.classList.remove('is-flipping');

    void flipCardInner.offsetWidth;

    flipCardInner.classList.remove('no-transition');

    isAnimating = false;
    moreButton.disabled = false;
  }, FLIP_DURATION_MS);
}

moreButton.addEventListener('pointerdown', () => {
  setPressedState(true);
});

moreButton.addEventListener('pointerup', clearPressedState);
moreButton.addEventListener('pointercancel', clearPressedState);
moreButton.addEventListener('lostpointercapture', clearPressedState);
moreButton.addEventListener('blur', clearPressedState);
moreButton.addEventListener('click', swapToNext);

mainPhoto.addEventListener('error', () => {
  mainPhoto.src = 'assets/images/photos/1.png';
  mainPhoto.alt = 'Фото';
});

if (nextPhoto) {
  nextPhoto.setAttribute('aria-hidden', 'true');
}

initializeContent();
