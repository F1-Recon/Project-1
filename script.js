// ============================================================
// ACTIVE NAV LINK ON SCROLL
// ============================================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a');

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.remove('active'));
        const active = document.querySelector(`nav a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  },
  { threshold: 0.35 }
);

sections.forEach((s) => navObserver.observe(s));

// ============================================================
// FADE-IN ON SCROLL
// ============================================================
const fadeEls = document.querySelectorAll(
  '.info-card, .fact-card, .timeline-item, .gallery-item, .visit-item, .nearby-card'
);

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

fadeEls.forEach((el) => fadeObserver.observe(el));

// ============================================================
// LIGHTBOX
// ============================================================
const galleryItems  = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox      = document.getElementById('lightbox');
const lbImg         = document.getElementById('lightbox-img');
const lbCaption     = document.getElementById('lightbox-caption');
const lbClose       = document.getElementById('lightbox-close');
const lbPrev        = document.getElementById('lightbox-prev');
const lbNext        = document.getElementById('lightbox-next');
let currentIndex    = 0;

function openLightbox(index) {
  currentIndex = index;
  const item = galleryItems[currentIndex];
  lbImg.src         = item.dataset.src;
  lbImg.alt         = item.querySelector('img').alt;
  lbCaption.textContent = item.dataset.caption;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lbImg.src = '';
  document.body.style.overflow = '';
}

function showPrev() {
  currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
  openLightbox(currentIndex);
}

function showNext() {
  currentIndex = (currentIndex + 1) % galleryItems.length;
  openLightbox(currentIndex);
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `Lihat foto: ${item.dataset.caption}`);
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openLightbox(i);
  });
});

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', showPrev);
lbNext.addEventListener('click', showNext);

// tutup kalau klik di luar gambar
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// navigasi keyboard
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   showPrev();
  if (e.key === 'ArrowRight')  showNext();
});

// ============================================================
// QUIZ
// ============================================================
const quizData = [
  {
    question: 'Siapa sultan pertama Banten yang membangun Keraton Surosowan?',
    options: [
      'Sultan Ageng Tirtayasa',
      'Sultan Maulana Yusuf',
      'Maulana Hasanuddin',
      'Sultan Haji'
    ],
    answer: 2,
    explanation: 'Maulana Hasanuddin, putra Sunan Gunung Jati, adalah sultan pertama Banten yang membangun Keraton Surosowan.'
  },
  {
    question: 'Pada tahun berapa Keraton Surosowan dihancurkan oleh pasukan Belanda?',
    options: ['1680', '1750', '1808', '1900'],
    answer: 2,
    explanation: 'Tahun 1808, atas perintah Gubernur Jenderal Daendels, Keraton Surosowan dihancurkan dan Kesultanan Banten dibubarkan.'
  },
  {
    question: 'Berapa perkiraan luas awal kompleks Keraton Surosowan?',
    options: ['Lebih dari 30.000 m²', 'Sekitar 5.000 m²', 'Kurang dari 1 hektar', '100.000 m²'],
    answer: 0,
    explanation: 'Kompleks Surosowan diperkirakan mencakup lebih dari 30.000 m², setara dengan sekitar empat lapangan sepak bola.'
  },
  {
    question: 'Sultan mana yang memperkuat tembok Surosowan dengan dinding bata dan karang laut?',
    options: [
      'Maulana Hasanuddin',
      'Sultan Ageng Tirtayasa',
      'Sultan Maulana Yusuf',
      'Sultan Haji'
    ],
    answer: 2,
    explanation: 'Sultan Maulana Yusuf (1570–1580) memperkuat tembok keraton seluas ±3,8 hektar dengan dinding bata dan karang laut.'
  },
  {
    question: 'Perusahaan dagang dari negara mana yang pernah mendirikan kantor di Banten pada abad ke-17?',
    options: ['Portugis', 'Spanyol', 'Prancis', 'Inggris (East India Company)'],
    answer: 3,
    explanation: 'Pedagang Inggris dari East India Company mendirikan kantor dagang di Banten pada awal abad ke-17.'
  }
];

let currentQ  = 0;
let score     = 0;
let answered  = false;

const qWrap     = document.getElementById('quiz-question-wrap');
const qResult   = document.getElementById('quiz-result');
const qQuestion = document.getElementById('quiz-question');
const qOptions  = document.getElementById('quiz-options');
const qFeedback = document.getElementById('quiz-feedback');
const qCounter  = document.getElementById('quiz-counter');
const qBar      = document.getElementById('quiz-progress-bar');
const qScoreNum = document.getElementById('quiz-score-num');
const qResultMsg= document.getElementById('quiz-result-msg');
const qRestart  = document.getElementById('quiz-restart');

function loadQuestion() {
  answered = false;
  const q = quizData[currentQ];

  qCounter.textContent  = `Soal ${currentQ + 1} dari ${quizData.length}`;
  qBar.style.width      = `${(currentQ / quizData.length) * 100}%`;
  qQuestion.textContent = q.question;
  qFeedback.textContent = '';
  qOptions.innerHTML    = '';

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className         = 'quiz-option';
    btn.textContent       = opt;
    btn.setAttribute('aria-label', opt);
    btn.addEventListener('click', () => selectAnswer(i));
    qOptions.appendChild(btn);
  });
}

function selectAnswer(index) {
  if (answered) return;
  answered = true;

  const q       = quizData[currentQ];
  const buttons = qOptions.querySelectorAll('.quiz-option');

  buttons.forEach((btn) => (btn.disabled = true));
  buttons[q.answer].classList.add('correct');

  if (index === q.answer) {
    score++;
    qFeedback.textContent = '✅ Benar! ' + q.explanation;
    qFeedback.style.color = '#2e7d32';
  } else {
    buttons[index].classList.add('wrong');
    qFeedback.textContent = '❌ Kurang tepat. ' + q.explanation;
    qFeedback.style.color = '#c62828';
  }

  // lanjut ke soal berikutnya setelah 1.8 detik
  setTimeout(() => {
    currentQ++;
    if (currentQ < quizData.length) {
      loadQuestion();
    } else {
      showResult();
    }
  }, 1800);
}

function showResult() {
  qBar.style.width = '100%';
  qWrap.classList.add('hidden');
  qResult.classList.remove('hidden');
  qScoreNum.textContent = score;

  const msgs = [
    'Terus semangat belajar sejarah! 📖',
    'Lumayan! Masih ada yang bisa digali lagi. 🔍',
    'Bagus! Pengetahuanmu cukup baik. 👍',
    'Hebat! Kamu hampir hafal semua sejarahnya. 🏆',
    'Sempurna! Kamu benar-benar ahli sejarah Banten! 🌟'
  ];

  const tier = score <= 1 ? 0 : score === 2 ? 1 : score === 3 ? 2 : score === 4 ? 3 : 4;
  qResultMsg.textContent = `Kamu menjawab ${score} dari ${quizData.length} soal dengan benar. ${msgs[tier]}`;
}

function restartQuiz() {
  currentQ = 0;
  score    = 0;
  qResult.classList.add('hidden');
  qWrap.classList.remove('hidden');
  loadQuestion();
}

qRestart.addEventListener('click', restartQuiz);

// inisialisasi quiz
loadQuestion();

// ============================================================
// SCROLL PROGRESS BAR
// ============================================================
const scrollBar = document.getElementById('scroll-progress');

window.addEventListener('scroll', () => {
  const scrollTop    = window.scrollY;
  const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
  const pct          = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollBar.style.width = pct + '%';
}, { passive: true });

// ============================================================
// PARALLAX HERO
// ============================================================
const hero = document.querySelector('.hero');

window.addEventListener('scroll', () => {
  if (window.scrollY < window.innerHeight) {
    // Gerakkan background lebih lambat dari scroll (faktor 0.4)
    hero.style.backgroundPositionY = `calc(center + ${window.scrollY * 0.4}px)`;
  }
}, { passive: true });

// ============================================================
// TYPEWRITER EFFECT
// ============================================================
const typewriterEl = document.querySelector('[data-typewriter]');

if (typewriterEl) {
  const fullText  = typewriterEl.dataset.typewriter;
  const speed     = 38; // ms per karakter
  let   index     = 0;

  // Tunda sedikit supaya hero sudah terlihat sepenuhnya
  setTimeout(function type() {
    if (index <= fullText.length) {
      typewriterEl.textContent = fullText.slice(0, index);
      index++;
      setTimeout(type, speed);
    } else {
      typewriterEl.classList.add('typing-done');
    }
  }, 600);
}

// ============================================================
// COUNTER ANIMATION
// ============================================================
function animateCounter(el) {
  const target   = parseInt(el.dataset.counter, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 1400; // ms
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = Math.round(eased * target);
    // Format ribuan dengan titik
    el.textContent = current.toLocaleString('id-ID') + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => {
  counterObserver.observe(el);
});

// ============================================================
// SECTION DIVIDER REVEAL
// ============================================================
const dividerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      dividerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.section-divider').forEach(el => {
  dividerObserver.observe(el);
});

// ============================================================
// SPARKLE PARTICLES (HERO)
// ============================================================
const canvas  = document.getElementById('sparkle-canvas');

if (canvas) {
  const ctx     = canvas.getContext('2d');
  let   sparks  = [];
  let   rafId;

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createSpark() {
    return {
      x:       randomBetween(0, canvas.width),
      y:       randomBetween(0, canvas.height),
      r:       randomBetween(0.5, 2.2),
      alpha:   0,
      maxAlpha:randomBetween(0.3, 0.8),
      speed:   randomBetween(0.003, 0.008),
      phase:   randomBetween(0, Math.PI * 2),
      drift:   randomBetween(-0.12, 0.12),   // horizontal drift
      rise:    randomBetween(-0.18, -0.06),  // upward movement
    };
  }

  // Inisialisasi partikel
  function initSparks(count) {
    sparks = [];
    for (let i = 0; i < count; i++) {
      const s = createSpark();
      s.alpha = randomBetween(0, s.maxAlpha); // mulai dari alpha acak
      sparks.push(s);
    }
  }

  function drawSparks() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sparks.forEach(s => {
      // Pulsasi alpha
      s.phase += s.speed;
      s.alpha  = s.maxAlpha * (0.5 + 0.5 * Math.sin(s.phase));

      // Gerak perlahan ke atas dengan drift
      s.x += s.drift;
      s.y += s.rise;

      // Reset jika keluar layar
      if (s.y < -4 || s.x < -4 || s.x > canvas.width + 4) {
        s.x     = randomBetween(0, canvas.width);
        s.y     = canvas.height + 4;
        s.phase = 0;
      }

      // Gambar titik emas
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 184, 75, ${s.alpha})`;
      ctx.fill();

      // Glow kecil
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 144, 31, ${s.alpha * 0.25})`;
      ctx.fill();
    });

    rafId = requestAnimationFrame(drawSparks);
  }

  // Kurangi partikel saat tab tidak aktif (hemat baterai)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      drawSparks();
    }
  });

  // Resize handler
  const ro = new ResizeObserver(() => {
    resizeCanvas();
    initSparks(55);
  });
  ro.observe(canvas);

  resizeCanvas();
  initSparks(55);
  drawSparks();
}
