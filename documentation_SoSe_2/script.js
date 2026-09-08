gsap.registerPlugin(ScrollTrigger);

const SPHERE_COUNT = 6;
const scene = document.querySelector('.animation-scene');
const spheres = [];

// 1. Створюємо 6 куль строго в центрі
for (let i = 0; i < SPHERE_COUNT; i++) {
  const sphere = document.createElement('div');
  sphere.className = 'sphere';
  scene.appendChild(sphere);
  spheres.push(sphere);
}

// Початковий стан куль (усі в центрі, невидимі)
gsap.set(spheres, {
  x: 0,
  y: 0,
  scale: 0,
  opacity: 0,
  xPercent: -50,
  yPercent: -50
});

// 2. Головний таймлайн анімації, прив'язаний до скролу сторінки
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.scroll-container',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.2, // М'яке і плавне слідування за коліщатком миші
    pin: '.animation-scene', // Фіксуємо сцену на екрані
  },
});

/* ЕТАП 1: Зникає текст "scroll down" */
tl.to('.scroll-hint', { opacity: 0, duration: 0.5 });

/* ЕТАП 2: Поява кулі (усі 6 куль виростають РАЗОМ у центрі як одна гігантська) */
tl.to(spheres, {
  scale: 5.5, // Величезна куля на старті
  opacity: 0.8,
  duration: 1.5,
  ease: 'power1.inOut'
});

/* ЕТАП 3: Розшарування та Спіральний вибух */
const radius = Math.min(window.innerWidth, window.innerHeight) * 0.38;

spheres.forEach((sphere, i) => {
  // 🚀 МАГІЯ ГЕОМЕТРІЇ: додаємо кут (+ 120 градусів) ОДРАЗУ при розрахунку.
  // Це вибудовує кулі в ідеальний ромб (3 зверху, 3 знизу) БЕЗ фізичного повороту сцени!
  const angle = (i / SPHERE_COUNT) * Math.PI * 2 - Math.PI / 2 + (120 * Math.PI / 180);
  
  const targetX = Math.cos(angle) * radius;
  const targetY = Math.sin(angle) * radius;

  // Кулі розлітаються по спіральній траєкторії індивідуально
  tl.to(sphere, {
    x: targetX,
    y: targetY,
    scale: 1.5, // Стандартний розмір куль після розльоту
    rotation: 90, // Додає ефект закручування кожній кулі окремо
    duration: 2,
    ease: 'power1.inOut'
  }, 'split');
});


/* ЕТАП 4: Зникнення центральної верхньої та центральної нижньої куль (Індекси 4 та 1) */
tl.addLabel('topBottomExit');

const topSphereRef = spheres[4];    // Фізично найвища по центру 🔝
const bottomSphereRef = spheres[1]; // Фізично найнижча по центру 🔚
const exitDistance = Math.max(window.innerWidth, window.innerHeight) * 1.5;

// 🚀 Тепер вони гарантовано і плавно летять вгору/вниз, ЗМЕНШУЮЧИСЬ у нуль та розчиняючись!
tl.to(topSphereRef, { 
  y: -exitDistance, 
  scale: 0,          // Зменшення до абсолютного нуля
  opacity: 0,        // Повне розчинення
  duration: 1.5, 
  ease: 'power1.in' 
}, 'topBottomExit');

tl.to(bottomSphereRef, { 
  y: exitDistance, 
  scale: 0,          // Зменшення до абсолютного нуля
  opacity: 0,        // Повне розчинення
  duration: 1.5, 
  ease: 'power1.in' 
}, 'topBottomExit');


/* ЕТАП 5: Фінал — Останні 4 бічні кулі розлітаються діагонально чітко по 4 кутах екрана */
tl.addLabel('finalExit');

// Отримуємо точні розміри екрана користувача, щоб кулі летіли прямо в кути монітора
const widthFactor = window.innerWidth * 1.2;
const heightFactor = window.innerHeight * 1.2;

// Робимо чистий масив ТІЛЬКИ з тих 4 бічних куль, які залишилися на екрані
// Після вильоту центральних, це індекси: 0, 2, 3, 5
const remainingFour = [spheres[0], spheres[2], spheres[3], spheres[5]];

// Масив з 4 точних напрямків (кутів екрана) для кожної кулі індивідуально:
const corners = [
  { x: -widthFactor,  y: -heightFactor }, // 1. Верхній лівий кут ↖️
  { x: widthFactor,   y: -heightFactor }, // 2. Верхній правий кут ↗️
  { x: -widthFactor,  y: heightFactor },  // 3. Нижній лівий кут ↙️
  { x: widthFactor,   y: heightFactor }   // 4. Нижній правий кут ↘️
];

remainingFour.forEach((sphere, index) => {
  // Перевіряємо, чи існує куля (захист від помилок у коді)
  if (sphere) {
    tl.to(sphere, {
      x: corners[index].x, // Штовхаємо строго у свій кут екрана
      y: corners[index].y, // Штовхаємо строго у свій кут екрана
      scale: 0,            // Зменшення до абсолютного нуля 🔘
      opacity: 0,          // Повне розчинення 💨
      duration: 1.8, 
      ease: 'power1.in'
    }, 'finalExit'); // 'finalExit' запускає рух всіх 4 куль ОДНОЧАСНО
  }
});
