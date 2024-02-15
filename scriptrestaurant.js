let piatti = [
  {
    nome: "Piatto 1",
    prezzo: "€10",
    categoria: "Antipasto",
    descrizione: "Descrizione piatto 1",
    immagine: "url_immagine_1",
  },
  {
    nome: "Piatto 2",
    prezzo: "€12",
    categoria: "Primo",
    descrizione: "Descrizione piatto 2",
    immagine: "url_immagine_2",
  },
  {
    nome: "Piatto 3",
    prezzo: "€8",
    categoria: "Secondo",
    descrizione: "Descrizione piatto 3",
    immagine: "url_immagine_3",
  },
  {
    nome: "Piatto 4",
    prezzo: "€15",
    categoria: "Dolce",
    descrizione: "Descrizione piatto 4",
    immagine: "url_immagine_4",
  },
  {
    nome: "Piatto 5",
    prezzo: "€15",
    categoria: "Dolce",
    descrizione: "Descrizione piatto 5",
    immagine: "url_immagine_4",
  },
];

let menuDiv = document.getElementById("menu");

piatti.forEach(function (piatto) {
  let piattoDiv = document.createElement("div");
  piattoDiv.className = `piatto ${piatto.categoria}`;
  piattoDiv.innerHTML = `
    <h2>${piatto.nome}</h2>
    <img src="${piatto.immagine}">
    <p>${piatto.descrizione}</p>
    <p class="categoria"style="display:none;">${piatto.categoria}</p>
    <p>${piatto.prezzo}</p> 
    `;
  menuDiv.appendChild(piattoDiv);
});

function filtra(categoria) {
  let piatti = document.getElementsByClassName("piatto");
  for (let i = 0; i < piatti.length; i++) {
    if (categoria === "Tutto") {
      piatti[i].classList.remove("hidden");
      piatti[i].querySelector(".categoria").style.display = "block";
    } else {
      if (piatti[i].classList.contains(categoria)) {
        piatti[i].classList.remove("hidden");
        piatti[i].querySelector(".categoria").style.display = "none";
      } else {
        piatti[i].classList.add("hidden");
      }
    }
  }
}
