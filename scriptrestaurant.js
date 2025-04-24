document.addEventListener("DOMContentLoaded", () => {
  caricaDati("piatti.json");

  // Imposta il pulsante "Tutto" come attivo all'inizio
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    if (btn.textContent.trim() === "Tutto") {
      btn.classList.add("active");
    }

    // Aggiungi event listener per gestire lo stato attivo dei pulsanti
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Resetta il campo di ricerca quando si cambia categoria
      document.getElementById("search-input").value = "";
    });
  });

  // Aggiungi event listener per la ricerca in tempo reale
  document
    .getElementById("search-input")
    .addEventListener("input", function () {
      cercaPiatti(this.value);
    });
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

  // Ottieni la categoria attiva corrente
  const categoriaAttiva = document
    .querySelector(".filter-btn.active")
    .textContent.trim();

  // Determina quali badge di categoria mostrare
  let badgeCategoria = "";
  if (categoriaAttiva === "Tutto") {
    // Se è selezionato "Tutto", mostra tutte le categorie
    if (Array.isArray(piatto.categorie)) {
      badgeCategoria = piatto.categorie
        .map((cat) => `<span class="categoria-badge">${cat}</span>`)
        .join("");
    } else {
      badgeCategoria = `<span class="categoria-badge">${piatto.categoria}</span>`;
    }
  } else {
    // Altrimenti, non mostrare badge per la categoria selezionata
    if (Array.isArray(piatto.categorie)) {
      badgeCategoria = piatto.categorie
        .filter((cat) => cat !== categoriaAttiva)
        .map((cat) => `<span class="categoria-badge">${cat}</span>`)
        .join("");
    }
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

function filtra(categoria) {
  // Resetta il campo di ricerca
  document.getElementById("search-input").value = "";

  const piatti = document.querySelectorAll(".piatto");

  if (categoria === "Tutto") {
    // Mostra tutti i piatti
    popolaMenu(tuttiPiatti);
  } else {
    // Filtra i piatti per categoria
    const piattoFiltrati = tuttiPiatti.filter((piatto) => {
      if (Array.isArray(piatto.categorie)) {
        return piatto.categorie.includes(categoria);
      } else {
        return piatto.categoria === categoria;
      }
    });

    popolaMenu(piattoFiltrati);
  }
}

function cercaPiatti(query) {
  query = query.toLowerCase().trim();

  // Se la query è vuota, mostra tutti i piatti della categoria corrente
  if (query === "") {
    const categoriaAttiva = document
      .querySelector(".filter-btn.active")
      .textContent.trim();
    filtra(categoriaAttiva);
    return;
  }

  // Ottieni la categoria attualmente selezionata
  const categoriaAttiva = document
    .querySelector(".filter-btn.active")
    .textContent.trim();

  // Filtra i piatti in base alla query e alla categoria selezionata
  const piattoFiltrati = tuttiPiatti.filter((piatto) => {
    // Verifica se il piatto corrisponde alla query di ricerca
    const matchQuery =
      piatto.nome.toLowerCase().includes(query) ||
      piatto.descrizione.toLowerCase().includes(query);

    // Se è selezionato "Tutto", mostra tutti i piatti che corrispondono alla query
    if (categoriaAttiva === "Tutto") {
      return matchQuery;
    } else {
      // Altrimenti, filtra anche per categoria
      const matchCategoria = Array.isArray(piatto.categorie)
        ? piatto.categorie.includes(categoriaAttiva)
        : piatto.categoria === categoriaAttiva;

      return matchQuery && matchCategoria;
    }
  });

  popolaMenu(piattoFiltrati);
}
