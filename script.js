const compliments = Array.isArray(window.COMPLIMENTS) ? window.COMPLIMENTS : [];
const photos = Array.isArray(window.PHOTOS) ? window.PHOTOS : [];

const mainPhoto = document.getElementById('mainPhoto');
const photoFrame = document.getElementById('photoFrame');
const frontText = document.getElementById('complimentTextFront');
const backText = document.getElementById('complimentTextBack');
const flipCardInner = document.getElementById('flipCardInner');
const moreButton = document.getElementById('moreButton');

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

function swapToNext() {
  if (isAnimating) return;
  isAnimating = true;

  const nextComplimentIndex = pickDifferentIndex(compliments, currentComplimentIndex);
  const nextPhotoIndex = pickDifferentIndex(photos, currentPhotoIndex);

  const nextCompliment = safeTextFromList(
    compliments,
    nextComplimentIndex,
    'У тебя есть редкий дар: делать пространство спокойнее одним своим присутствием.'
  );

  backText.textContent = nextCompliment;
  flipCardInner.classList.add('is-flipping');
  photoFrame.classList.add('is-changing');

  const nextPhoto = normalizePhoto(photos[nextPhotoIndex]);

  window.setTimeout(() => {
    mainPhoto.src = nextPhoto.src;
    mainPhoto.alt = nextPhoto.alt;
  }, 260);

  window.setTimeout(() => {
    frontText.textContent = nextCompliment;
    currentComplimentIndex = nextComplimentIndex;
    currentPhotoIndex = nextPhotoIndex;

    flipCardInner.classList.add('no-transition');
    flipCardInner.classList.remove('is-flipping');

    void flipCardInner.offsetWidth;

    flipCardInner.classList.remove('no-transition');
    photoFrame.classList.remove('is-changing');

    isAnimating = false;
  }, 820);
}

moreButton.addEventListener('click', swapToNext);

mainPhoto.addEventListener('error', () => {
  mainPhoto.src = 'assets/images/photos/1.png';
  mainPhoto.alt = 'Фото';
});

initializeContent();
