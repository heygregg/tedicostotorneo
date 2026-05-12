let matches = [];

fetch("matches.json")
  .then(res => res.json())
  .then(data => {
    matches = data;
    renderMatches();
    renderRanking();
    renderScorers();
  });

function renderMatches() {
  const container = document.getElementById("matches");
  container.innerHTML = "";

  matches.forEach(m => {
    const div = document.createElement("div");
    div.className = "match";

    div.innerHTML = `
      <strong>${m.teams[0].name} vs ${m.teams[1].name}</strong><br>
      Risultato: ${m.score[0]} - ${m.score[1]}<br>
    `;

    const btn = document.createElement("button");
    btn.textContent = "INFO";
    btn.onclick = () => showMatch(m);

    div.appendChild(btn);
    container.appendChild(div);
  });
}

function showMatch(match) {
  const c = document.getElementById("players");

  let html = `<h3>${match.teams[0].name} vs ${match.teams[1].name}</h3>`;

  match.teams.forEach(t => {
    html += `<h4>${t.name}</h4><ul>`;
    t.players.forEach(p => {
      const g = t.goals[p] || 0;
      html += `<li>${p} - Gol: ${g}</li>`;
    });
    html += `</ul>`;
  });

  c.innerHTML = html;
}

function renderRanking() {
  const table = {};

  matches.forEach(m => {
    const a = m.teams[0].name;
    const b = m.teams[1].name;

    if (!table[a]) table[a] = 0;
    if (!table[b]) table[b] = 0;

    if (m.score[0] > m.score[1]) table[a] += 3;
    else if (m.score[1] > m.score[0]) table[b] += 3;
    else {
      table[a] += 1;
      table[b] += 1;
    }
  });

  const el = document.getElementById("ranking");
  el.innerHTML = Object.entries(table)
    .sort((a, b) => b[1] - a[1])
    .map(t => `<div>${t[0]}: ${t[1]} punti</div>`)
    .join("");
}

function renderScorers() {
  const scorers = {};

  matches.forEach(m => {
    m.teams.forEach(t => {
      for (const [player, goals] of Object.entries(t.goals)) {
        scorers[player] = (scorers[player] || 0) + goals;
      }
    });
  });

  const el = document.getElementById("scorers");

  el.innerHTML = Object.entries(scorers)
    .sort((a, b) => b[1] - a[1])
    .map(s => `<div>${s[0]}: ${s[1]} gol</div>`)
    .join("");
}