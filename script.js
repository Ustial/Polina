const compliments = Array.isArray(window.COMPLIMENTS) ? window.COMPLIMENTS : [];
const photos = Array.isArray(window.PHOTOS) ? window.PHOTOS : [];

const mainPhoto = document.getElementById('mainPhoto');
const nextPhoto = document.getElementById('nextPhoto');
const frontText = document.getElementById('complimentTextFront');
const backText = document.getElementById('complimentTextBack');
const flipCardInner = document.getElementById('flipCardInner');
const moreButton = document.getElementById('moreButton');

const PHOTO_FADE_MS = 180;
const FLIP_DURATION_MS = 560;

let currentComplimentIndex = 0;
let currentPhotoIndex = 0;
let isAnimating = false;

const loadedPhotoSrcSet = new Set();
const photoPreloadPromises = new Map();

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

function pickFastPhotoIndex() {
  if (!Array.isArray(photos) || photos.length <= 1) {
    return pickDifferentIndex(photos, currentPhotoIndex);
  }

  const loadedIndexes = [];
  for (let i = 0; i < photos.length; i += 1) {
    if (i === currentPhotoIndex) continue;
    const { src } = normalizePhoto(photos[i]);
    if (loadedPhotoSrcSet.has(src)) {
      loadedIndexes.push(i);
    }
  }

  if (loadedIndexes.length > 0) {
    const randomLoadedIndex = Math.floor(Math.random() * loadedIndexes.length);
    return loadedIndexes[randomLoadedIndex];
  }

  return pickDifferentIndex(photos, currentPhotoIndex);
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
  loadedPhotoSrcSet.add(photo.src);
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
  if (loadedPhotoSrcSet.has(src)) {
    return Promise.resolve();
  }

  if (photoPreloadPromises.has(src)) {
    return photoPreloadPromises.get(src);
  }

  const preloadPromise = new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      loadedPhotoSrcSet.add(src);
      resolve();
    };

    image.onerror = () => {
      resolve();
    };

    image.src = src;
  });

  photoPreloadPromises.set(src, preloadPromise);
  return preloadPromise;
}

function warmupPhotoCache() {
  photos.forEach((item) => {
    const { src } = normalizePhoto(item);
    preloadPhoto(src);
  });
}

function setPressedState(isPressed) {
  moreButton.classList.toggle('is-pressed', isPressed);
}

function clearPressedState() {
  setPressedState(false);
}

function runPhotoSwap(nextPhotoData) {
  nextPhoto.src = nextPhotoData.src;
  nextPhoto.alt = nextPhotoData.alt;

  window.requestAnimationFrame(() => {
    nextPhoto.classList.add('is-active');
    mainPhoto.classList.remove('is-active');
  });

  window.setTimeout(() => {
    mainPhoto.src = nextPhotoData.src;
    mainPhoto.alt = nextPhotoData.alt;
    mainPhoto.classList.add('is-active');
    nextPhoto.classList.remove('is-active');
    nextPhoto.alt = '';
  }, PHOTO_FADE_MS);
}

function swapToNext() {
  if (isAnimating) return;
  isAnimating = true;
  moreButton.disabled = true;

  const nextComplimentIndex = pickDifferentIndex(compliments, currentComplimentIndex);
  const nextPhotoIndex = pickFastPhotoIndex();

  const nextCompliment = safeTextFromList(
    compliments,
    nextComplimentIndex,
    'У тебя есть редкий дар: делать пространство спокойнее одним своим присутствием.'
  );

  const nextPhotoData = normalizePhoto(photos[nextPhotoIndex]);

  backText.textContent = nextCompliment;
  flipCardInner.classList.add('is-flipping');

  if (loadedPhotoSrcSet.has(nextPhotoData.src)) {
    runPhotoSwap(nextPhotoData);
  } else {
    preloadPhoto(nextPhotoData.src).then(() => {
      runPhotoSwap(nextPhotoData);
    });
  }

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
warmupPhotoCache();
