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
    function renderInfo(m) {
      let left = `<h4>${m.teams[0].name} vs ${m.teams[1].name}</h4>`; 

      m.teams.forEach(t => {
        left += `<strong>${t.name}</strong><ul>`;

        if (!t.goals) { //!goals significa "se il goal non esiste"
          left += `<li><em>Goal non assegnati</em></li>`; //
        } else {
          t.players.forEach(p => { //per ogni squadra, cicla i giocatori 'p' e dall'array goals prende i goal di ogni p
            const g = t.goals[p] || 0; //assegna quei goal a una costatne g. Se non ci sono goal inserisce '0'
            left += `<li>${p} - Gol: ${g}</li>`; //aggiunge alla stringa la riga tipo <li> Greg - Gol: 3 </li>
          });
        }

        left += `</ul>`; //chiude l'elenco dei giocatori
      });

      const right = `
        <div class="match-desc">  //costruire la colonna destra con data e descrizione
          <h4>Analisi partita</h4>
          <p><strong>Data:</strong> ${m.date}</p>
          <p>${m.description || "Nessuna descrizione disponibile."}</p> // se nel JSON non c'è una descrizione mostra test di default
        </div>
      `;

      infoBox.innerHTML = ` //innerHTML rappresenta il contenuto interno dell'elemento infoBox. Gli sto assegnando una stringa per dirgli di inserire questo HTML nell'infoBox
        <div class="info-grid">
          <div class="info-left">${left}</div> //inserisce la colonna di sinistra nell'info-box
          <div class="info-right">${right}</div> //inserisce la colonna di destra nell'info-box
        </div>
      `;
}

    // Gestisce il click del pulsante INFO ogni votla che viene cliccato
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
      <strong>${m.teams[0].name} vs ${m.teams[1].name}</strong> n//nomi delle squadra in grassetto
      &nbsp;&nbsp;&nbsp;&nbsp;Data: ${m.date}<br> //creo una piccola distanza prima della data e poi la data
      Risultato: ${m.score[0]} - ${m.score[1]} //il risultato della partita
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

  matches.forEach(m => {
    const a = m.teams[0].name; // Nome squadra A
    const b = m.teams[1].name; // Nome squadra B

    // Se la squadra non esiste ancora nella tabella, la crea
    if (!table[a]) table[a] = { points: 0, gf: 0, ga: 0, played: 0 };
    if (!table[b]) table[b] = { points: 0, gf: 0, ga: 0, played: 0 };

    table[a].played++;
    table[b].played++;
    
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
          <div class="sub">
            ${stats.played} match • Goal Fatti ${stats.gf} • Goal Subiti ${stats.ga}
          </div>
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
