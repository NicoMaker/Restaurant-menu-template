// ─────────────── STATE ───────────────
let tuttiPiatti = [];

// Emoji/icone per categorie speciali (opzionale, si può estendere)
const CAT_ICONS = {
  'Pesce':       '🐟',
  'Vegetariano': '🌿',
  'Specialità':  '⭐',
  'Vegan':       '🥦',
  'Senza glutine': '🌾',
};

const IMAGE_MAP = {
  'url_immagine_1': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  'url_immagine_2': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  'url_immagine_3': 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=80',
  'url_immagine_4': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
};

// ─────────────── INIT ───────────────
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const heroBg = document.getElementById('hero-bg');
    if (heroBg) heroBg.classList.add('loaded');
  }, 100);

  fetch('piatti.json')
    .then(r => { if (!r.ok) throw new Error('Fetch failed'); return r.json(); })
    .then(data => {
      tuttiPiatti = data.map(normalizza);
      costruisciFiltri(tuttiPiatti);   // <-- genera bottoni dal JSON
      render(tuttiPiatti, [], true);
      bindFiltri();                    // <-- attacca eventi dopo aver creato i bottoni
    })
    .catch(() => {
      document.getElementById('menu').innerHTML = `
        <div class="no-results">
          <div class="nr-icon">⚠️</div>
          <p>Impossibile caricare il menù. Verifica che <strong>piatti.json</strong> sia nella stessa cartella.</p>
        </div>`;
    });

  document.getElementById('search-input').addEventListener('input', filtra);

  document.getElementById('modal-close').addEventListener('click', chiudiModal);
  document.getElementById('modal-backdrop').addEventListener('click', e => {
    if (e.target === e.currentTarget) chiudiModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') chiudiModal(); });
});

// ─────────────── GENERA BOTTONI FILTRO DAL JSON ───────────────
function costruisciFiltri(lista) {
  // Raccoglie tutte le categorie uniche preservando l'ordine di apparizione
  const ordineBase = ['Antipasto', 'Primo', 'Secondo', 'Dolce'];
  const tutteCategorie = new Set();

  lista.forEach(p => p.categorie.forEach(c => tutteCategorie.add(c)));

  // Ordina: prima quelle in ordineBase nell'ordine definito, poi le altre alfabeticamente
  const categorieOrdinale = [
    ...ordineBase.filter(c => tutteCategorie.has(c)),
    ...[...tutteCategorie].filter(c => !ordineBase.includes(c)).sort()
  ];

  const nav = document.getElementById('filter-nav');
  nav.innerHTML = ''; // svuota

  // Bottone "Tutto"
  const btnTutto = document.createElement('button');
  btnTutto.className = 'filter-btn active';
  btnTutto.dataset.category = 'Tutto';
  btnTutto.dataset.label = 'Tutto';
  btnTutto.innerHTML = `Tutto <span class="filter-count">${lista.length}</span>`;
  nav.appendChild(btnTutto);

  // Bottoni per ogni categoria
  categorieOrdinale.forEach(cat => {
    const count = lista.filter(p => p.categorie.includes(cat)).length;
    const icon = CAT_ICONS[cat] ? `${CAT_ICONS[cat]} ` : '';
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.category = cat;
    btn.dataset.label = `${icon}${cat}`;
    btn.innerHTML = `${icon}${cat} <span class="filter-count">${count}</span>`;
    nav.appendChild(btn);
  });
}

// ─────────────── BIND EVENTI FILTRI ───────────────
function bindFiltri() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;

      if (cat === 'Tutto') {
        // Tutto: tutti attivi per effetto visivo, ma logica = mostra tutto
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Evidenzia tutti i filtri
        document.querySelectorAll('.filter-btn:not([data-category="Tutto"])').forEach(b => b.classList.add('all-highlight'));
      } else {
        // Rimuove highlight globale
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('all-highlight'));
        // Deseleziona "Tutto"
        document.querySelector('.filter-btn[data-category="Tutto"]').classList.remove('active');
        // Toggle questo filtro
        btn.classList.toggle('active');

        // Se non rimane nessun filtro attivo → riattiva Tutto con highlight
        const attivi = document.querySelectorAll('.filter-btn.active');
        if (attivi.length === 0) {
          const tuttoBtn = document.querySelector('.filter-btn[data-category="Tutto"]');
          tuttoBtn.classList.add('active');
          document.querySelectorAll('.filter-btn:not([data-category="Tutto"])').forEach(b => b.classList.add('all-highlight'));
        }
      }

      filtra();
    });
  });

  // All'avvio con "Tutto" attivo → tutti evidenziati
  document.querySelectorAll('.filter-btn:not([data-category="Tutto"])').forEach(b => b.classList.add('all-highlight'));
}

// ─────────────── NORMALIZZAZIONE ───────────────
function normalizza(p) {
  if (IMAGE_MAP[p.immagine]) p.immagine = IMAGE_MAP[p.immagine];

  if (Array.isArray(p.categorie) && p.categorie.length > 0) {
    // ok
  } else if (typeof p.categoria === 'string' && p.categoria) {
    p.categorie = [p.categoria];
  } else {
    p.categorie = ['Altro'];
  }

  if (!Array.isArray(p.ingredienti) || p.ingredienti.length === 0) {
    p.ingredienti = estraiIngredienti(p.descrizione);
  }
  return p;
}

function estraiIngredienti(desc) {
  return desc.split(/,\s?/).slice(0, 5)
    .map(s => s.trim()
      .replace(/^(con|e|al|ai|agli|alla|alle|di)\s/i, '')
      .replace(/^\w/, c => c.toUpperCase())
    );
}

// ─────────────── FILTRO ───────────────
function filtra() {
  const q = document.getElementById('search-input').value.toLowerCase().trim();
  const attivi = [...document.querySelectorAll('.filter-btn.active')]
    .map(b => b.dataset.category).filter(c => c !== 'Tutto');
  const tuttoAttivo = document.querySelector('.filter-btn[data-category="Tutto"]').classList.contains('active');

  const risultati = tuttiPiatti.filter(p => {
    const matchTesto = !q ||
      p.nome.toLowerCase().includes(q) ||
      p.descrizione.toLowerCase().includes(q) ||
      p.ingredienti.some(i => i.toLowerCase().includes(q)) ||
      p.categorie.some(c => c.toLowerCase().includes(q));

    const matchCategoria = tuttoAttivo || attivi.length === 0 ||
      p.categorie.some(c => attivi.includes(c));

    return matchTesto && matchCategoria;
  });

  render(risultati, attivi, tuttoAttivo);
}

// ─────────────── RENDER ───────────────
function render(lista, categorieFiltro = [], tuttoAttivo = true) {
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
    const card = creaCard(piatto, categorieFiltro, tuttoAttivo);
    card.style.animationDelay = `${i * 0.07}s`;
    container.appendChild(card);
  });
}

function creaCard(piatto, categorieFiltro, tuttoAttivo) {
  const card = document.createElement('div');
  card.className = 'piatto ' + piatto.categorie.map(c => c.replace(/\s+/g, '-')).join(' ');

  const badgesHTML = piatto.categorie.map((c, i) => {
    const isMatch = !tuttoAttivo && categorieFiltro.includes(c);
    const icon = CAT_ICONS[c] ? `${CAT_ICONS[c]} ` : '';
    return `<span class="badge ${i === 0 ? 'badge-main' : 'badge-extra'}${isMatch ? ' badge-highlight' : ''}">${icon}${c}</span>`;
  }).join('');

  const pillsHTML = piatto.categorie.map(c => {
    const isActive = !tuttoAttivo && categorieFiltro.includes(c);
    const icon = CAT_ICONS[c] ? `${CAT_ICONS[c]} ` : '';
    return `<span class="cat-pill${isActive ? ' cat-pill-active' : ''}">${icon}${c}</span>`;
  }).join('');

  card.innerHTML = `
    <div class="piatto-img">
      <img src="${piatto.immagine}" alt="${piatto.nome}" loading="lazy">
      <div class="badges">${badgesHTML}</div>
      ${piatto.categorie.length > 1 ? `<span class="multi-badge">${piatto.categorie.length}×</span>` : ''}
    </div>
    <div class="piatto-body">
      <h2 class="piatto-nome">${piatto.nome}</h2>
      <p class="piatto-desc">${piatto.descrizione}</p>
      <div class="piatto-pills">${pillsHTML}</div>
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

// ─────────────── MODAL ───────────────
function apriModal(piatto) {
  document.getElementById('modal-img').src = piatto.immagine;
  document.getElementById('modal-img').alt = piatto.nome;
  document.getElementById('modal-nome').textContent = piatto.nome;
  document.getElementById('modal-desc').textContent = piatto.descrizione;
  document.getElementById('modal-prezzo').textContent = `${piatto.prezzo.toFixed(2)} ${piatto.valuta}`;

  document.getElementById('modal-badges').innerHTML = piatto.categorie
    .map(c => {
      const icon = CAT_ICONS[c] ? `${CAT_ICONS[c]} ` : '';
      return `<span class="modal-badge">${icon}${c}</span>`;
    }).join('');

  document.getElementById('modal-ingredients').innerHTML = piatto.ingredienti
    .map(i => `<span class="ingredient-tag">${i}</span>`).join('');

  document.getElementById('modal-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function chiudiModal() {
  document.getElementById('modal-backdrop').classList.remove('open');
  document.body.style.overflow = '';
}