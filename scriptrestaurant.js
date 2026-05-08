// ─────────────── STATE ───────────────
let tuttiPiatti = [];

// ─────────────── INIT ───────────────
document.addEventListener('DOMContentLoaded', () => {
  // Hero parallax entrance
  setTimeout(() => {
    const heroBg = document.getElementById('hero-bg');
    if (heroBg) heroBg.classList.add('loaded');
  }, 100);

  // Load data
  fetch('piatti.json')
    .then(r => { if (!r.ok) throw new Error('Fetch failed'); return r.json(); })
    .then(data => {
      tuttiPiatti = data.map(arricchisci);
      render(tuttiPiatti);
    })
    .catch(() => {
      document.getElementById('menu').innerHTML = `
        <div class="no-results">
          <div class="nr-icon">⚠️</div>
          <p>Impossibile caricare il menù. Verifica che <strong>piatti.json</strong> sia nella stessa cartella.</p>
        </div>`;
    });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;
      if (cat === 'Tutto') {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      } else {
        btn.classList.toggle('active');
        document.querySelector('.filter-btn[data-category="Tutto"]').classList.remove('active');
        const active = document.querySelectorAll('.filter-btn.active');
        const others = document.querySelectorAll('.filter-btn:not([data-category="Tutto"])');
        if (active.length === 0 || active.length === others.length) {
          others.forEach(b => b.classList.remove('active'));
          document.querySelector('.filter-btn[data-category="Tutto"]').classList.add('active');
        }
      }
      filtra();
    });
  });

  // Search
  document.getElementById('search-input').addEventListener('input', filtra);

  // Modal close
  document.getElementById('modal-close').addEventListener('click', chiudiModal);
  document.getElementById('modal-backdrop').addEventListener('click', e => {
    if (e.target === e.currentTarget) chiudiModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') chiudiModal(); });
});

// ─────────────── DATA HELPERS ───────────────
const IMAGE_MAP = {
  'url_immagine_1': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  'url_immagine_2': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  'url_immagine_3': 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=80',
  'url_immagine_4': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
};

function arricchisci(p) {
  if (IMAGE_MAP[p.immagine]) p.immagine = IMAGE_MAP[p.immagine];
  if (!Array.isArray(p.categorie)) p.categorie = [p.categoria];
  if (!p.ingredienti) p.ingredienti = estraiIngredienti(p.descrizione);
  return p;
}

function estraiIngredienti(desc) {
  return desc
    .split(/,\s?/)
    .slice(0, 5)
    .map(s => s.trim().replace(/^(con|e|al|ai|agli|alla|alle)\s/i, '').replace(/^\w/, c => c.toUpperCase()));
}

// ─────────────── RENDER ───────────────
function render(lista) {
  const container = document.getElementById('menu');
  const count = document.getElementById('results-count');
  container.innerHTML = '';
  count.textContent = `${lista.length} piatt${lista.length === 1 ? 'o' : 'i'}`;

  if (!lista.length) {
    container.innerHTML = `
      <div class="no-results">
        <div class="nr-icon">🍽</div>
        <p>Nessun piatto trovato. Prova con un'altra ricerca.</p>
      </div>`;
    return;
  }

  lista.forEach((piatto, i) => {
    const card = creaCard(piatto);
    card.style.animationDelay = `${i * 0.07}s`;
    container.appendChild(card);
  });
}

function creaCard(piatto) {
  const card = document.createElement('div');
  const cats = piatto.categorie || [piatto.categoria];
  card.className = 'piatto ' + cats.join(' ');

  const badgesHTML = cats
    .map((c, j) => `<span class="badge ${j === 0 ? 'badge-main' : 'badge-extra'}">${c}</span>`)
    .join('');

  card.innerHTML = `
    <div class="piatto-img">
      <img src="${piatto.immagine}" alt="${piatto.nome}" loading="lazy">
      <div class="badges">${badgesHTML}</div>
    </div>
    <div class="piatto-body">
      <h2 class="piatto-nome">${piatto.nome}</h2>
      <p class="piatto-desc">${piatto.descrizione}</p>
      <div class="piatto-footer">
        <span class="piatto-prezzo">${piatto.prezzo.toFixed(2)} ${piatto.valuta}</span>
        <span class="btn-detail">
          Dettagli
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </span>
      </div>
    </div>`;

  card.addEventListener('click', () => apriModal(piatto));
  return card;
}

// ─────────────── FILTER ───────────────
function filtra() {
  const q = document.getElementById('search-input').value.toLowerCase().trim();
  const active = [...document.querySelectorAll('.filter-btn.active')].map(b => b.dataset.category);
  const showAll = active.includes('Tutto');

  const risultati = tuttiPiatti.filter(p => {
    const matchQ = !q || p.nome.toLowerCase().includes(q) || p.descrizione.toLowerCase().includes(q);
    const matchC = showAll || p.categorie.some(c => active.includes(c));
    return matchQ && matchC;
  });

  render(risultati);
}

// ─────────────── MODAL ───────────────
function apriModal(piatto) {
  document.getElementById('modal-img').src = piatto.immagine;
  document.getElementById('modal-img').alt = piatto.nome;
  document.getElementById('modal-nome').textContent = piatto.nome;
  document.getElementById('modal-desc').textContent = piatto.descrizione;
  document.getElementById('modal-prezzo').textContent = `${piatto.prezzo.toFixed(2)} ${piatto.valuta}`;

  const badges = document.getElementById('modal-badges');
  badges.innerHTML = (piatto.categorie || [piatto.categoria])
    .map(c => `<span class="modal-badge">${c}</span>`)
    .join('');

  const ings = document.getElementById('modal-ingredients');
  ings.innerHTML = (piatto.ingredienti || [])
    .map(i => `<span class="ingredient-tag">${i}</span>`)
    .join('');

  document.getElementById('modal-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function chiudiModal() {
  document.getElementById('modal-backdrop').classList.remove('open');
  document.body.style.overflow = '';
}