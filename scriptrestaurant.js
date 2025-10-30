document.addEventListener("DOMContentLoaded", () => {
  caricaDati("piatti.json");

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const categoria = btn.getAttribute("data-category");

      if (categoria === "Tutto") {
        // Se si clicca "Tutto", disattiva gli altri e attiva solo "Tutto"
        document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      } else {
        // Altrimenti, gestisci la selezione/deselezione del pulsante
        btn.classList.toggle("active");
        // Disattiva "Tutto" se si seleziona un'altra categoria
        document.querySelector('.filter-btn[data-category="Tutto"]').classList.remove("active");
      }

      const activeButtons = document.querySelectorAll(".filter-btn.active");
      const categoryButtons = document.querySelectorAll('.filter-btn:not([data-category="Tutto"])');

      // Se nessuna categoria è selezionata o tutte sono selezionate, attiva "Tutto"
      if (activeButtons.length === 0 || activeButtons.length === categoryButtons.length) {
        categoryButtons.forEach((b) => b.classList.remove("active"));
        document.querySelector('.filter-btn[data-category="Tutto"]').classList.add("active");
      }

      // Filtra i piatti in base alle nuove selezioni
      filtraPiatti();
    });
  });

  // Aggiungi event listener per la ricerca in tempo reale
  document
    .getElementById("search-input")
    .addEventListener("input", filtraPiatti);
});

// Variabile globale per memorizzare tutti i piatti
let tuttiPiatti = [];

function caricaDati(url) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nel caricamento dei dati");
      }
      return response.json();
    })
    .then((data) => {
      // Aggiungi immagini reali se mancanti
      data = data.map((piatto) => {
        if (piatto.immagine === "url_immagine_1") {
          piatto.immagine =
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
        } else if (piatto.immagine === "url_immagine_2") {
          piatto.immagine =
            "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
        } else if (piatto.immagine === "url_immagine_3") {
          piatto.immagine =
            "https://images.unsplash.com/photo-1432139555190-58524dae6a55?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
        } else if (piatto.immagine === "url_immagine_4") {
          piatto.immagine =
            "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
        }

        // Assicurati che la categoria sia un array
        if (!Array.isArray(piatto.categorie)) {
          piatto.categorie = [piatto.categoria];
        }

        return piatto;
      });

      // Salva tutti i piatti nella variabile globale
      tuttiPiatti = data;

      popolaMenu(data);
    })
    .catch((error) => {
      console.error("Errore:", error);
      document.getElementById("menu").innerHTML = `
        <div class="errore">
          <p>Si è verificato un errore nel caricamento dei dati. Riprova più tardi.</p>
        </div>
      `;
    });
}

function popolaMenu(data) {
  const menuDiv = document.getElementById("menu");
  menuDiv.innerHTML = "";

  // Aggiungi un ritardo crescente per l'animazione
  data.forEach((piatto, index) => {
    const piattoDiv = creaElementoPiatto(piatto);
    piattoDiv.style.animationDelay = `${index * 0.1}s`;
    menuDiv.appendChild(piattoDiv);
  });

  // Se non ci sono risultati
  if (data.length === 0) {
    menuDiv.innerHTML = `
      <div class="no-results">
        <p>Nessun piatto trovato. Prova con un'altra ricerca.</p>
      </div>
    `;
  }
}

function creaElementoPiatto(piatto) {
  const piattoDiv = document.createElement("div");

  // Aggiungi tutte le categorie come classi
  let classiCategorie = "";
  if (Array.isArray(piatto.categorie)) {
    piatto.categorie.forEach((cat) => {
      classiCategorie += ` ${cat}`;
    });
  } else {
    classiCategorie = piatto.categoria;
  }

  piattoDiv.className = `piatto${classiCategorie}`;

  // Mostra sempre tutte le categorie del piatto come badge
  let badgeCategoria = "";
  if (Array.isArray(piatto.categorie)) {
    badgeCategoria = piatto.categorie
      .map((cat) => `<span class="categoria-badge">${cat}</span>`)
      .join("");
  } else {
    badgeCategoria = `<span class="categoria-badge">${piatto.categoria}</span>`;
  }

  piattoDiv.innerHTML = `
    <div class="piatto-img-container">
      <img src="${piatto.immagine}" alt="${piatto.nome}">
      ${badgeCategoria}
    </div>
    <div class="piatto-content">
      <h2>${piatto.nome}</h2>
      <p class="piatto-descrizione">${piatto.descrizione}</p>
      <p class="piatto-prezzo">${piatto.prezzo} ${piatto.valuta}</p>
    </div>
  `;

  return piattoDiv;
}

function filtraPiatti() {
  const query = document.getElementById("search-input").value.toLowerCase().trim();
  
  // Ottieni le categorie attive
  const activeCategories = [...document.querySelectorAll(".filter-btn.active")]
    .map(btn => btn.getAttribute("data-category"));

  // Controlla se "Tutto" è selezionato
  const showAll = activeCategories.includes("Tutto");

  const piattoFiltrati = tuttiPiatti.filter((piatto) => {
    // Verifica se il piatto corrisponde alla query di ricerca
    const matchQuery =
      piatto.nome.toLowerCase().includes(query) ||
      piatto.descrizione.toLowerCase().includes(query);

    // Verifica se il piatto appartiene a una delle categorie selezionate
    const matchCategoria = showAll || piatto.categorie.some(cat => activeCategories.includes(cat));

    return matchQuery && matchCategoria;
  });

  popolaMenu(piattoFiltrati);
}
