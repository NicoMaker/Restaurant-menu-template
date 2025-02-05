document.addEventListener("DOMContentLoaded", () => {
  caricaDati("piatti.json");
});

function caricaDati(url) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => popolaMenu(data))
    .catch((error) => console.error("Errore nel caricamento dei dati:", error));
}

function popolaMenu(data) {
  const menuDiv = document.getElementById("menu");
  menuDiv.innerHTML = "";

  data.forEach((piatto) => {
    const piattoDiv = creaElementoPiatto(piatto);
    menuDiv.appendChild(piattoDiv);
  });
}

function creaElementoPiatto(piatto) {
  const piattoDiv = document.createElement("div");
  piattoDiv.className = `piatto ${piatto.categoria}`;
  piattoDiv.innerHTML = `
      <h2>${piatto.nome}</h2>
      <img src="${piatto.immagine}" alt="${piatto.nome}">
      <p>${piatto.descrizione}</p>
      <p class="categoria" style="display:none;">${piatto.categoria}</p>
      <p><strong>Prezzo:</strong> ${piatto.prezzo}€</p>
  `;
  return piattoDiv;
}

function filtra(categoria) {
  const piatti = document.querySelectorAll(".piatto");
  piatti.forEach((piatto) => {
    const isCategoriaMatch =
      piatto.classList.contains(categoria) || categoria === "Tutto";
    piatto.style.display = isCategoriaMatch ? "block" : "none";
  });
}
