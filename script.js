// Questo script carica i dati delle partite da un file JSON e li visualizza nella pagina.
// Gestisce: elenco partite, classifica squadre e marcatori.

let matches = []; // Array che conterrà tutte le partite caricate dal JSON

// Carica i dati dal file matches.json
fetch("matches.json")
  .then(res => res.json()) // Converte la risposta in JSON
  .then(data => {
    matches = data; // Salva i dati nel nostro array

    renderMatches();  // Mostra le partite
    renderRanking();  // Calcola e mostra la classifica
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
    const div = document.createElement("div"); // Crea un blocco per la partita
    div.className = "match"; // Applica la classe CSS

    let isOpen = false; // Stato per mostrare/nascondere i dettagli

    const infoBox = document.createElement("div"); // Box con i dettagli della partita
    infoBox.className = "info-box";
    infoBox.style.display = "none"; // Nascosto di default

    const btn = document.createElement("button"); // Pulsante INFO
    btn.textContent = "INFO";

    // Funzione che genera l'HTML dei dettagli della partita
    function renderInfo() {
      let html = `<h4>${m.teams[0].name} vs ${m.teams[1].name}</h4>`;

      // Per ogni squadra della partita
      m.teams.forEach(t => {
        html += `<strong>${t.name}</strong><ul>`;

        if (!t.goals) {
          // Se non ci sono dati sui goal
          html += `<li><em>Goal non assegnati</em></li>`;
        } else {
          // Per ogni giocatore della squadra
          t.players.forEach(p => {
            const g = t.goals[p] || 0; // Goal del giocatore (0 se non presente)
            html += `<li>${p} - Gol: ${g}</li>`;
          });
        }

        html += `</ul>`;
      });

      infoBox.innerHTML = html; // Inserisce l'HTML nel box
    }

    // Gestisce il click del pulsante INFO
    btn.onclick = () => {
      isOpen = !isOpen; // Inverte lo stato (aperto/chiuso)

      if (isOpen) {
        renderInfo(); // Genera i dettagli
        infoBox.style.display = "block"; // Mostra il box
        btn.textContent = "MOSTRA MENO"; // Cambia testo pulsante
      } else {
        infoBox.style.display = "none"; // Nasconde il box
        btn.textContent = "INFO"; // Ripristina testo pulsante
      }
    };

    // Inserisce le informazioni principali della partita
    div.innerHTML = `
      <strong>${m.teams[0].name} vs ${m.teams[1].name}</strong>
      &nbsp;&nbsp;&nbsp;&nbsp;Data: ${m.date}<br>
      Risultato: ${m.score[0]} - ${m.score[1]}
    `;

    div.appendChild(btn);     // Aggiunge il pulsante
    div.appendChild(infoBox); // Aggiunge il box dei dettagli

    container.appendChild(div); // Aggiunge la partita al contenitore
  });
}

/* =========================
   CLASSIFICA SQUADRE
========================= */

// Funzione che calcola e mostra la classifica
function renderRanking() {
  const table = {}; // Oggetto che conterrà punti, goal fatti e subiti per squadra

  matches.forEach(m => {
    const a = m.teams[0].name; // Nome squadra A
    const b = m.teams[1].name; // Nome squadra B

    // Se la squadra non esiste ancora nella tabella, la crea
    if (!table[a]) table[a] = { points: 0, gf: 0, ga: 0 };
    if (!table[b]) table[b] = { points: 0, gf: 0, ga: 0 };

    // Aggiorna goal fatti e subiti
    table[a].gf += m.score[0];
    table[a].ga += m.score[1];
    table[b].gf += m.score[1];
    table[b].ga += m.score[0];

    // Assegna punti
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
  el.innerHTML = Object.entries(table)
    .sort(([, a], [, b]) => {
      if (b.points !== a.points) return b.points - a.points; // Prima i punti
      const gdA = a.gf - a.ga; // Differenza reti squadra A
      const gdB = b.gf - b.ga; // Differenza reti squadra B
      return gdB - gdA; // Ordina per differenza reti
    })
    .map(([team, stats], index) =>
      // Genera la card HTML della squadra
      `<div class="ranking-card">
        <div class="rank">${index + 1}</div>
        <div class="info">
          <div class="team">${team}</div>
          <div class="sub">GF ${stats.gf} • GS ${stats.ga}</div>
        </div>
        <div class="points">${stats.points}</div>
      </div>`
    )
    .join("");
}

/* =========================
   MARCATORI
========================= */

// Funzione che calcola e mostra i marcatori
function renderScorers() {
  const scorers = {}; // Oggetto: giocatore → gol totali

  matches.forEach(m => {
    m.teams.forEach(t => {
      if (!t.goals) return; // Se la squadra non ha goal registrati, salta

      // Somma i goal di ogni giocatore
      for (const [player, goals] of Object.entries(t.goals)) {
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
    .map(s => `<div>${s[0]}: ${s[1]} gol</div>`)
    .join("");
}
