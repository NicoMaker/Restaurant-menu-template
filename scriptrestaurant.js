const menuDiv = document.getElementById("menu");

fetch('piatti.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(piatto => {
      let piattoDiv = document.createElement("div");
      piattoDiv.className = `piatto ${piatto.categoria}`;
      piattoDiv.innerHTML = `
        <h2>${piatto.nome}</h2>
        <img src="${piatto.immagine}">
        <p>${piatto.descrizione}</p>
        <p class="categoria" style="display:none;">${piatto.categoria}</p>
        <p>${piatto.prezzo}</p> 
      `;
      menuDiv.appendChild(piattoDiv);
    });
  })
  .catch(error => console.error('Error:', error));

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
      } else 
        piatti[i].classList.add("hidden");
    }
  }
}