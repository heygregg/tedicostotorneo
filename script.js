const matches = [
  {
    id: "06052026",
    teams: ["Brigata Luchezio", "Gioventù Alpina"],
    score: "18 - 14",
    date: "06/05/2026",
    players: {
      "Brigata Luchezio": ["PARDO", "GREG", "HAMZA", "DAMIO", "LUCHEZIO"],
      "Gioventù Alpina": ["CITA", "WILLO", "MORO", "ALPO", "BURA"]
    },
  }
    id: "12052026",
    teams: ["River Pres", "Gioventù Alpina"],
    score: " - ",
    date: "12/05/2026",
    players: {
    "River Pres": ["CITA", "GIOI", "SIMO", "PRES", "SPRE"],
    "Gioventù Alpina": ["PARDO", "GREG", "BURA", "ALPO", "SERA"]
    }
}
];

const matchesContainer = document.getElementById("matches");

function renderMatches() {
  matchesContainer.innerHTML = "";

  matches.forEach(match => {
    const div = document.createElement("div");
    div.className = "match";

    div.innerHTML = `
      <span class="team">${match.teams[0]} vs ${match.teams[1]}</span>
      <span class="date">${match.date}</span>
      <div class="right-side">
        <span class="score">${match.score}</span>
        <button class="info-btn" onclick="showInfo('${match.id}')">Info</button>
      </div>
    `;

    matchesContainer.appendChild(div);
  });
}

function showInfo(id) {
  const container = document.getElementById("players");

  const match = matches.find(m => m.id === id);

  if (!match) {
    container.innerHTML = "Partita non trovata";
    return;
  }

  let html = `<h3>${match.teams[0]} vs ${match.teams[1]}</h3>`;

  for (const [team, players] of Object.entries(match.players)) {
    html += `<h4>${team}</h4><ul>`;
    players.forEach(p => {
      html += `<li>${p}</li>`;
    });
    html += `</ul>`;
  }

  container.innerHTML = html;
}

renderMatches();
