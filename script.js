// Questo script carica i dati delle partite da un file JSON e li visualizza nella pagina web.
// Gestisce la visualizzazione delle partite, della classifica delle squadre e dei marcatori.

let matches = [];

// Carica i dati dal file matches.json
fetch("matches.json")
  .then(res => res.json())
  .then(data => {
    matches = data;

    renderMatches();
    renderRanking();
    renderScorers();
  })
  .catch(err => {
    console.error("Errore caricamento JSON:", err);
  });

/* =========================
   PARTITE
========================= */
// Funzione per visualizzare le partite nella pagina
function renderMatches() {
  const container = document.getElementById("matches");
  container.innerHTML = "";

  matches.forEach(m => {
    const div = document.createElement("div");
    div.className = "match";

    let isOpen = false;

    const infoBox = document.createElement("div");
    infoBox.className = "info-box";
    infoBox.style.display = "none";

    const btn = document.createElement("button");
    btn.textContent = "INFO";

    // Funzione per rendere le informazioni dettagliate della partita
    function renderInfo() {
      let html = `<h4>${m.teams[0].name} vs ${m.teams[1].name}</h4>`;

      m.teams.forEach(t => {
        html += `<strong>${t.name}</strong><ul>`;
        t.players.forEach(p => {
          const g = t.goals[p] || 0;
          html += `<li>${p} - Gol: ${g}</li>`;
        });
        html += `</ul>`;
      });

      infoBox.innerHTML = html;
    }

    // Gestisce il click del pulsante INFO per mostrare/nascondere i dettagli
    btn.onclick = () => {
      isOpen = !isOpen;

      if (isOpen) {
        renderInfo();
        infoBox.style.display = "block";
        btn.textContent = "MOSTRA MENO";
      } else {
        infoBox.style.display = "none";
        btn.textContent = "INFO";
      }
    };

    div.innerHTML = `
      <strong>${m.teams[0].name} vs ${m.teams[1].name}</strong><br>
      Risultato: ${m.score[0]} - ${m.score[1]}
    `;

    div.appendChild(btn);
    div.appendChild(infoBox);

    container.appendChild(div);
  });
}

/* =========================
   CLASSIFICA SQUADRE
========================= */
// Funzione per calcolare e visualizzare la classifica delle squadre
function renderRanking() {
  const table = {}; // Oggetto per memorizzare i punti delle squadre

  matches.forEach(m => {
    const a = m.teams[0].name;
    const b = m.teams[1].name;

    if (!table[a]) table[a] = 0;
    if (!table[b]) table[b] = 0;

    // Assegna punti: 3 per vittoria, 1 per pareggio, 0 per sconfitta
    if (m.score[0] > m.score[1]) {
      table[a] += 3;
    } else if (m.score[1] > m.score[0]) {
      table[b] += 3;
    } else {
      table[a] += 1;
      table[b] += 1;
    }
  });

  const el = document.getElementById("ranking");

  el.innerHTML = Object.entries(table)
    .sort((a, b) => b[1] - a[1]) // Ordina per punti decrescenti
    .map(t => `<div>${t[0]}: ${t[1]} punti</div>`)
    .join("");
}

/* =========================
   MARCATORI
========================= */
// Funzione per calcolare e visualizzare i marcatori (giocatori con più gol)
function renderScorers() {
  const scorers = {}; // Oggetto per memorizzare i gol dei giocatori

  matches.forEach(m => {
    m.teams.forEach(t => {
      for (const [player, goals] of Object.entries(t.goals)) {
        scorers[player] = (scorers[player] || 0) + goals; // Somma i gol per giocatore
      }
    });
  });

  const el = document.getElementById("scorers");

  el.innerHTML = Object.entries(scorers)
    .sort((a, b) => b[1] - a[1]) // Ordina per gol decrescenti
    .map(s => `<div>${s[0]}: ${s[1]} gol</div>`)
    .join("");
}