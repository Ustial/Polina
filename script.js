const compliments = Array.isArray(window.COMPLIMENTS) ? window.COMPLIMENTS : [];
const photos = Array.isArray(window.PHOTOS) ? window.PHOTOS : [];

const mainPhoto = document.getElementById("mainPhoto");
const nextPhoto = document.getElementById("nextPhoto");
const frontText = document.getElementById("complimentTextFront");
const backText = document.getElementById("complimentTextBack");
const flipCardInner = document.getElementById("flipCardInner");
const moreButton = document.getElementById("moreButton");

const FLIP_DURATION_MS = 360;
const PHOTO_SWAP_MAX_WAIT_MS = 120;

let currentComplimentIndex = 0;
let currentPhotoIndex = 0;
let isAnimating = false;
let activePhotoElement = mainPhoto;
const loadedPhotoSrcSet = new Set();

function safeTextFromList(list, index, fallback) {
  return list[index] ?? fallback;
}

function normalizePhoto(item) {
  if (!item) {
    return { src: "assets/images/photos/1.png", alt: "Фото" };
  }

  if (typeof item === "string") {
    return { src: item, alt: "Фото" };
  }

  return {
    src: item.src || "assets/images/photos/1.png",
    alt: item.alt || "Фото",
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
    "Ты выглядишь как человек, который умеет превращать обычный день в хороший.",
  );
  frontText.textContent = text;
  backText.textContent = text;
}

function applyPhoto(index) {
  const photo = normalizePhoto(photos[index]);
  mainPhoto.src = photo.src;
  mainPhoto.alt = photo.alt;
  mainPhoto.classList.add("is-active");
  nextPhoto.src = photo.src;
  nextPhoto.alt = photo.alt;
  nextPhoto.classList.remove("is-active");
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
  moreButton.classList.toggle("is-pressed", isPressed);
}

function clearPressedState() {
  setPressedState(false);
}

function preloadPhoto(src) {
  if (!src) return Promise.resolve();
  if (loadedPhotoSrcSet.has(src)) return Promise.resolve();

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      loadedPhotoSrcSet.add(src);
      resolve();
    };
    img.onerror = resolve;
    img.src = src;
  });
}

function runPhotoSwap(nextPhotoData) {
  const fromPhoto = activePhotoElement;
  const toPhoto = fromPhoto === mainPhoto ? nextPhoto : mainPhoto;

  toPhoto.src = nextPhotoData.src;
  toPhoto.alt = nextPhotoData.alt;

  requestAnimationFrame(() => {
    toPhoto.classList.add("is-active");
    fromPhoto.classList.remove("is-active");
    activePhotoElement = toPhoto;
  });
}

function swapToNext() {
  if (isAnimating) return;
  spawnHearts();
  isAnimating = true;
  moreButton.disabled = true;

  const nextComplimentIndex = pickDifferentIndex(
    compliments,
    currentComplimentIndex,
  );
  const nextPhotoIndex = pickFastPhotoIndex();

  const nextCompliment = safeTextFromList(
    compliments,
    nextComplimentIndex,
    "У тебя есть редкий дар: делать пространство спокойнее одним своим присутствием.",
  );

  const nextPhotoData = normalizePhoto(photos[nextPhotoIndex]);

  backText.textContent = nextCompliment;
  flipCardInner.classList.add("is-flipping");
  let hasSwappedPhoto = false;

  const startPhotoSwap = () => {
    if (hasSwappedPhoto) return;
    hasSwappedPhoto = true;
    runPhotoSwap(nextPhotoData);
  };

  Promise.race([
    preloadPhoto(nextPhotoData.src),
    new Promise((resolve) =>
      window.setTimeout(resolve, PHOTO_SWAP_MAX_WAIT_MS),
    ),
  ]).then(startPhotoSwap);

  window.setTimeout(() => {
    frontText.textContent = nextCompliment;
    currentComplimentIndex = nextComplimentIndex;
    currentPhotoIndex = nextPhotoIndex;

    flipCardInner.classList.add("no-transition");
    flipCardInner.classList.remove("is-flipping");

    void flipCardInner.offsetWidth;

    flipCardInner.classList.remove("no-transition");

    isAnimating = false;
    moreButton.disabled = false;
  }, FLIP_DURATION_MS);
}

function spawnHearts() {
  const colors = ["#c94040", "#b8384e", "#d4607a", "#e09aaa", "#9f2e27"];
  const count = 11;

  for (let i = 0; i < count; i++) {
    window.setTimeout(() => {
      const el = document.createElement("span");
      el.className = "heart-rain-particle";
      el.setAttribute("aria-hidden", "true");
      el.textContent = "♥";

      const left = 3 + Math.random() * 94;
      const size = (0.8 + Math.random() * 1.05).toFixed(2);
      const duration = (2.6 + Math.random() * 2.2).toFixed(2);
      const dx = Math.round(-70 + Math.random() * 140);
      const color = colors[Math.floor(Math.random() * colors.length)];

      el.style.left = `${left}%`;
      el.style.fontSize = `${size}rem`;
      el.style.color = color;
      el.style.setProperty("--fall-duration", `${duration}s`);
      el.style.setProperty("--dx", `${dx}px`);

      document.body.appendChild(el);
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, i * 95);
  }
}

moreButton.addEventListener("pointerdown", () => {
  setPressedState(true);
});

moreButton.addEventListener("pointerup", clearPressedState);
moreButton.addEventListener("pointercancel", clearPressedState);
moreButton.addEventListener("lostpointercapture", clearPressedState);
moreButton.addEventListener("blur", clearPressedState);
moreButton.addEventListener("click", swapToNext);

function handlePhotoError(event) {
  const photoElement = event.currentTarget;
  photoElement.src = "assets/images/photos/1.png";
  photoElement.alt = "Фото";
}

mainPhoto.addEventListener("error", handlePhotoError);
nextPhoto.addEventListener("error", handlePhotoError);

if (nextPhoto) {
  nextPhoto.setAttribute("aria-hidden", "true");
}

initializeContent();
preloadPhoto(normalizePhoto(photos[currentPhotoIndex]).src);
window.setTimeout(() => {
  photos.forEach((photoItem) => {
    preloadPhoto(normalizePhoto(photoItem).src);
  });
}, 0);
