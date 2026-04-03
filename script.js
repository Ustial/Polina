const compliments = Array.isArray(window.COMPLIMENTS) ? window.COMPLIMENTS : [];
const photos = Array.isArray(window.PHOTOS) ? window.PHOTOS : [];

const mainPhoto = document.getElementById('mainPhoto');
const nextPhoto = document.getElementById('nextPhoto');
const photoFrame = document.getElementById('photoFrame');
const frontText = document.getElementById('complimentTextFront');
const backText = document.getElementById('complimentTextBack');
const flipCardInner = document.getElementById('flipCardInner');
const moreButton = document.getElementById('moreButton');

const PHOTO_FADE_MS = 220;
const FLIP_DURATION_MS = 820;

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
  nextPhoto.src = photo.src;
  nextPhoto.alt = '';
  mainPhoto.classList.add('is-active');
  nextPhoto.classList.remove('is-active');
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

function preloadPhoto(src) {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = resolve;
    image.onerror = resolve;
    image.src = src;
  });
}

function setPressedState(isPressed) {
  moreButton.classList.toggle('is-pressed', isPressed);
}

function clearPressedState() {
  setPressedState(false);
}

async function swapToNext() {
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

  await preloadPhoto(nextPhotoData.src);

  nextPhoto.src = nextPhotoData.src;
  nextPhoto.alt = nextPhotoData.alt;
  photoFrame.classList.add('is-changing');
  nextPhoto.classList.add('is-active');
  mainPhoto.classList.remove('is-active');

  window.setTimeout(() => {
    mainPhoto.src = nextPhotoData.src;
    mainPhoto.alt = nextPhotoData.alt;
    mainPhoto.classList.add('is-active');
    nextPhoto.classList.remove('is-active');
    nextPhoto.alt = '';
    photoFrame.classList.remove('is-changing');
  }, PHOTO_FADE_MS);

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

nextPhoto.addEventListener('error', () => {
  nextPhoto.src = 'assets/images/photos/1.png';
  nextPhoto.alt = '';
});

initializeContent();
