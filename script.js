// SCRIPT.JS gestisce: elenco partite, classifica squadre e marcatori, galleria foto

let matches = []; // Array che conterrà tutte le partite caricate dal JSON
let players = {}; // variabile esterna
// Carica i dati dal file matches.json
fetch("matches.json")
  .then(res => res.json()) // Converte la risposta in JSON
  .then(data => {
    matches = data; // Salva i dati nel nostro array

    renderMatches();  // Mostra le partite
    renderRanking();  // Calcola e mostra la classifica
    renderPlayers();
    renderScorers();  // Calcola e mostra i marcatori
    
  })
  .catch(err => {
    console.error("Errore caricamento JSON:", err); // Gestione errori
  });

/* =========================
   PARTITE
========================= */

// Funzione che crea e mostra tutte le partite nella pagina
function renderMatches() {
  const container = document.getElementById("matches"); // Contenitore HTML
  container.innerHTML = ""; // Pulisce eventuali contenuti precedenti

  matches.forEach(m => { // Cicla ogni partita
  //calcolo se la partita è futura
  // Calcola se la partita è futura
    const [day, month, year] = m.date.split("/");
    const matchDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isFuture = matchDate > today;

    const div = document.createElement("div");
    div.className = "match";

    // Se futura: box semplice senza pulsante né dettagli
    if (isFuture) {
      div.innerHTML = `
        <strong>${m.teams[0].name} vs ${m.teams[1].name}</strong><br>
        Data: ${m.date}<br>
        <em>NEXT MATCH</em>
      `;
      container.appendChild(div);
      return; // Salta tutto il resto per questa partita
    }
    
    let isOpen = false; // Stato per mostrare/nascondere i dettagli

    const infoBox = document.createElement("div"); // Box con i dettagli della partita
    infoBox.className = "info-box";
    infoBox.style.display = "none"; // Nascosto di default

    const btn = document.createElement("button"); // Pulsante INFO
    btn.textContent = "INFO";

    // Funzione che genera l'HTML dei dettagli della partita
    function renderInfo(m) {
      let left = `<h4>${m.teams[0].name} vs ${m.teams[1].name}</h4>`; 

      m.teams.forEach(t => {
        left += `<strong>${t.name}</strong><ul>`;

        if (!t.goals) { //!goals significa "se il goal non esiste"
          left += `<li><em>Goal non assegnati</em></li>`; //
        } else {
          t.players.forEach(p => { // per ogni squadra, cicla i giocatori 'p' e dall'array goals prende i goal di ogni p
            const g = t.goals[p] || 0; // assegna quei goal a una costante g. Se non ci sono goal inserisce '0'
            left += `<li>${p} - Gol: ${g}</li>`; // aggiunge alla stringa la riga tipo <li> Greg - Gol: 3 </li>
          });
        }

        left += `</ul>`; //chiude l'elenco dei giocatori
      });
      // costruire la colonna destra con data e descrizione
      const right = `
        <div class="match-desc">  
          <h4>Analisi partita</h4>
          <p><strong>Data:</strong> ${m.date}</p>
          <p>${m.description || "Nessuna descrizione disponibile."}</p> 
        </div>
      `;
      //innerHTML rappresenta il contenuto interno dell'elemento infoBox. Gli sto assegnando una stringa per dirgli di inserire questo HTML nell'infoBox
      infoBox.innerHTML = ` 
        <div class="info-grid">
          <div class="info-left">${left}</div> 
          <div class="info-right">${right}</div> 
        </div>
      `;
}

    // Gestisce il click del pulsante INFO ogni voLta che viene cliccato
    btn.onclick = () => {
      isOpen = !isOpen; // Inverte lo stato (aperto/chiuso) 

      if (isOpen) {
        renderInfo(m); // Genera i dettagli
        infoBox.style.display = "block"; // Mostra il box
        btn.textContent = "MOSTRA MENO"; // Cambia testo pulsante
      } else {
        infoBox.style.display = "none"; // Nasconde il box
        btn.textContent = "INFO"; // Ripristina testo pulsante
      }
    };

    // Inserisce le informazioni principali della partita nel DIV
    div.innerHTML = `
      <strong>${m.teams[0].name} vs ${m.teams[1].name}</strong><br> <!-- nomi squadre in grassetto -->
      Data: ${m.date}<br> <!-- creo una piccola distanza prima della data e poi la data -->
      Risultato: ${m.score[0]} - ${m.score[1]} <!-- il risultato della partita -->
    `;

    div.appendChild(btn);     // Aggiunge il pulsante dentro <div class ="match">
    div.appendChild(infoBox); // Aggiunge il box dei dettagli dentro <div class ="match">

    container.appendChild(div); // Aggiunge il <div> dentro il container <div id ="matches">
  }); //CHIUDO IL CICLO
}

/* =========================
   CLASSIFICA SQUADRE
========================= */

// Funzione che calcola e mostra la classifica
function renderRanking() {
  const table = {}; // Oggetto che conterrà punti, goal fatti e subiti per squadra

  matches.forEach(m => { //cicla ogni partita 
    const a = m.teams[0].name; // Nome squadra A //per ogni partita assegna il nome della prima squadra ad a
    const b = m.teams[1].name; // Nome squadra B //per ogni partita assegna il nome della seconda squadra a b

    // Se la squadra non esiste ancora nella tabella, la crea
    if (!table[a]) table[a] = { points: 0, gf: 0, ga: 0, played: 0 };
    if (!table[b]) table[b] = { points: 0, gf: 0, ga: 0, played: 0 };

    table[a].played++; //cerca nel dizionario table{} una determinata squadra e incrementa le partite giocate
    table[b].played++;
    
    // Aggiorna goal fatti e subiti per ogni squadra nel dizionario table{}
    table[a].gf += m.score[0];
    table[a].ga += m.score[1];
    table[b].gf += m.score[1];
    table[b].ga += m.score[0];

    // Assegna punti in base ai valori dentro l'array score
    if (m.score[0] > m.score[1]) {
      table[a].points += 3; // Vittoria squadra A
    } else if (m.score[1] > m.score[0]) {
      table[b].points += 3; // Vittoria squadra B
    } else {
      table[a].points += 1; // Pareggio
      table[b].points += 1;
    }
  });

  const el = document.getElementById("ranking"); // Contenitore classifica

  // Ordina le squadre per punti e differenza reti
  el.innerHTML = Object.entries(table) //converte l'oggetto in un array di coppie
    .sort(([, a], [, b]) => { //ordina il dizionario;la virgola prima di a e b salta il primo elemnto della coppia (il nome squadra)
      if (b.points !== a.points) return b.points - a.points; // 
      const gdA = a.gf - a.ga; // Differenza reti squadra A
      const gdB = b.gf - b.ga; // Differenza reti squadra B
      return gdB - gdA; // Ordina per differenza reti
    })
    .map(([team, stats], index) => //trasforma ogni squadra in una stringa HTML
      // Genera la card HTML della squadra
      `<div class="ranking-card ${index < 3 ? 'top-three' : ''}">
        <div class="rank">${index + 1}</div>
        <div class="info">
          <div class="team">${team}</div>
          <div class="sub">
            ${stats.played} match • Goal Fatti ${stats.gf} • Goal Subiti ${stats.ga}
          </div>
        </div>
        <div class="points">${stats.points}</div>
      </div>` 
        )
    .join(""); //unisce tute le stringhe HTML in una sola senza separatori e la assegna a el.innerHTML
}

/* =========================
   CLASSIFICA MARCATORI
========================= */

// Funzione che calcola e mostra i marcatori
function renderScorers() {
  const scorers = {}; // Oggetto: giocatore → gol totali; è un dizionario

  matches.forEach(m => {
    m.teams.forEach(t => {
      if (!t.goals) return; // Se la squadra non ha goal registrati, salta

      // Somma i goal di ogni giocatore
      for (const [player, goals] of Object.entries(t.goals)) { //Object.entries(t.goals) converte l'oggetto goals in array di coppie:
        scorers[player] = (scorers[player] || 0) + goals;
      }
    });
  });

  const el = document.getElementById("scorers"); // Contenitore marcatori

  const entries = Object.entries(scorers);

  if (entries.length === 0) {
    el.innerHTML = "Nessun marcatore disponibile"; // Nessun dato
    return;
  }

  // Ordina i giocatori per numero di goal
 el.innerHTML = entries
  .sort((a, b) => b[1] - a[1])
  .map((s, index) => `
    <div class="ranking-card ${index < 3 ? 'top-three' : ''}">
      <div class="rank">${index + 1}</div>

      <div class="info">
        <div class="team">${s[0]}</div>
        <div class="sub">
              ${players[s[0]]?.played ?? 0} partite giocate •
              ${s[1] > 0 
                ? `1 gol ogni ${Math.round((players[s[0]]?.played ?? 0) * 60 / s[1])} min` 
                : 'nessun gol'}
        </div>
      </div>

      <div class="points">${s[1]} gol</div>
    </div>
  `)
  .join("");
}
/* =========================
   CLASSIFICA GIOCATORI
========================= */
function renderPlayers() {
  players = {}; // ← assegni quella esterna, non ne crei una nuova

  matches.forEach(m => {
    let pointsA, pointsB;
    if (m.score[0] > m.score[1]) {
      pointsA = 3; pointsB = 0;
    } else if (m.score[1] > m.score[0]) {
      pointsA = 0; pointsB = 3;
    } else {
      pointsA = 1; pointsB = 1;
    }

    m.teams.forEach((t, index) => {
      const teamPoints = index === 0 ? pointsA : pointsB;

      t.players.forEach(p => {
        if (!players[p]) players[p] = { played: 0, points: 0 };
        players[p].played++;
        players[p].points += teamPoints;
      });
    });
  });

  const el = document.getElementById("players");
  const entries = Object.entries(players);

  if (entries.length === 0) {
    el.innerHTML = "Nessun giocatore disponibile";
    return;
  }

  el.innerHTML = entries
    .sort(([, a], [, b]) => {
        if (b.points !== a.points) return b.points - a.points; // Prima per punti (desc)
        return a.played - b.played; // A parità di punti, meno partite = più in alto
    })
    .map(([name, stats], index) =>
      `<div class="ranking-card ${index < 3 ? 'top-three' : ''}">
        <div class="rank">${index + 1}</div>
        <div class="info">
          <div class="team">${name}</div>
          <div class="sub">${stats.played} partite giocate</div>
        </div>
        <div class="points">${stats.points}</div>
      </div>`
    )
    .join("");
}

/* =========================
   GALLERIA FOTO
========================= */
// Array che contiene tutte le foto: per aggiungerne una nuova basta aggiungere una riga
const foto = [
  { src: "2026-05-05_locandina.jpg", alt: "Locandina1" },
  { src: "2026-05-05_match.jpg", alt: "Match1" },
  { src: "2026-05-05_match2.jpg", alt: "Match1-1"},
  { src: "2026-05-12_locandina.jpg", alt: "Locandina2" },
  { src: "2026-05-12_match.jpg", alt: "Match2" },
  { src: "2026-05-12_match2.jpg", alt: "Match2-1" },
  { src: "Kaltakgirone-Citano.jpg", alt: "Locandina2" },
  { src: "Intervista_Cita.jpg", alt: "Intervista_Cita" },
  { src: "2026-05-19_news1.jpg", alt: "News1" },
  { src: "2026-05-19_news3.jpg", alt: "News3" },
  { src: "2026-05-26_news1.jpg", alt: "News4" }
 /* { src: "Intervista_Vehab.jpg", alt: "Intervista_Vehab" } */
];

// Prende dal file HTML l'elemento con id="gallery-grid" (il contenitore della griglia)
const grid = document.getElementById("gallery-grid");
// Controlla che gallery-grid esista nella pagina (evita errori su home.html, info.html ecc.)
if (grid) {
  // Per ogni foto nell'array, esegue il codice dentro le parentesi graffe
  foto.forEach(f => {
    // Crea un nuovo elemento <div> vuoto
    const item = document.createElement("div");
    // Gli assegna la classe "gallery-item" (quella del CSS)
    item.className = "gallery-item";
    // Ci mette dentro un <img> con src e alt presi dall'oggetto foto
    item.innerHTML = `<img src="${f.src}" alt="${f.alt}">`;
    // Aggiunge il div appena creato dentro gallery-grid nel HTML
    grid.appendChild(item);
  });
}

/* =========================
   MENU' HAMBURGER MOBILE
========================= */
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
const sidebarClose = document.getElementById("sidebar-close");
const sidebarOverlay = document.getElementById("sidebar-overlay");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    sidebar.classList.add("active");
    sidebarOverlay.classList.add("active");
  });

  sidebarClose.addEventListener("click", () => {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
  });

  sidebarOverlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
  });
}

/* =========================
   LIGHTBOX
========================= */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");

if (lightbox && lightboxImg && lightboxClose) {
  // Apre il lightbox cliccando una foto
  document.querySelectorAll(".gallery-item img").forEach(img => {
    img.addEventListener("click", () => {
      lightboxImg.src = img.src;
      lightbox.classList.add("active");
    });
  });

  // Chiude con il tasto X
  lightboxClose.addEventListener("click", () => {
    lightbox.classList.remove("active");
  });

  // Chiude cliccando fuori dalla foto
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove("active");
    }
  });
  // =========================
// LIGHTBOX ZOOM
// =========================
let scale = 1;

// SCROLL MOUSE (desktop)
lightboxImg.addEventListener("wheel", (e) => {
  e.preventDefault();
  scale += e.deltaY * -0.01;
  scale = Math.min(Math.max(scale, 1), 4); // min 1x, max 4x
  lightboxImg.style.transform = `scale(${scale})`;
});

// PINCH TO ZOOM (mobile)
let initialDistance = 0;

lightbox.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    initialDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }
});

lightbox.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const currentDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    scale *= currentDistance / initialDistance;
    scale = Math.min(Math.max(scale, 1), 4);
    lightboxImg.style.transform = `scale(${scale})`;
    initialDistance = currentDistance;
  }
}, { passive: false });

// Reset zoom quando chiudi il lightbox
lightboxClose.addEventListener("click", () => {
  scale = 1;
  lightboxImg.style.transform = "scale(1)";
  lightbox.classList.remove("active");
});

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    scale = 1;
    lightboxImg.style.transform = "scale(1)";
    lightbox.classList.remove("active");
  }
});

}

// =========================
// PLAYERS LIST
// =========================
const playersGrid = document.getElementById("players-grid");

if (playersGrid) {
  fetch("players-list.json")
    .then(res => res.json())
    .then(players => {
      players.forEach(p => {
        const card = document.createElement("div");
        card.className = "player-card";
        card.innerHTML = `
          <img src="${p.foto}" alt="${p.nome}">
          <div class="player-info">
            <h3>${p.nome}</h3>
            <p class="player-meta">${p.eta} anni · ${p.ruolo}</p>
            <p class="player-desc">${p.descrizione}</p>
            <div class="player-tags">
              ${p.caratteristiche.map(c => `<span class="tag">${c}</span>`).join("")}
            </div>
          </div>
        `;
        playersGrid.appendChild(card);
      });
    });
}
