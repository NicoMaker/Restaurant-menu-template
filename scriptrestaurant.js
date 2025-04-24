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
    });
  });
});

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
        return piatto;
      });

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
}

function creaElementoPiatto(piatto) {
  const piattoDiv = document.createElement("div");
  piattoDiv.className = `piatto ${piatto.categoria}`;

  piattoDiv.innerHTML = `
    <div class="piatto-img-container">
      <img src="${piatto.immagine}" alt="${piatto.nome}">
      <span class="categoria-badge">${piatto.categoria}</span>
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
  const piatti = document.querySelectorAll(".piatto");

  piatti.forEach((piatto) => {
    if (categoria === "Tutto") {
      piatto.style.display = "block";
      // Resetta l'animazione
      piatto.style.animation = "none";
      setTimeout(() => {
        piatto.style.animation = "fadeIn 0.5s ease-out forwards";
      }, 10);
    } else {
      if (piatto.classList.contains(categoria)) {
        piatto.style.display = "block";
        // Resetta l'animazione
        piatto.style.animation = "none";
        setTimeout(() => {
          piatto.style.animation = "fadeIn 0.5s ease-out forwards";
        }, 10);
      } else {
        piatto.style.display = "none";
      }
    }
  });
}
