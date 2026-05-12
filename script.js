const data = {
  milanInter: `
    <h3>Milan</h3>
    <ul>
      <li>Leao</li>
      <li>Giroud</li>
      <li>Theo Hernandez</li>
    </ul>

    <h3>Inter</h3>
    <ul>
      <li>Lautaro</li>
      <li>Barella</li>
      <li>Bastoni</li>
    </ul>
  `,

  juveRoma: `
    <h3>Juventus</h3>
    <ul>
      <li>Chiesa</li>
      <li>Vlahovic</li>
      <li>Locatelli</li>
    </ul>

    <h3>Roma</h3>
    <ul>
      <li>Dybala</li>
      <li>Pellegrini</li>
      <li>Lukaku</li>
    </ul>
  `,

  napoliLazio: `
    <h3>Napoli</h3>
    <ul>
      <li>Osimhen</li>
      <li>Kvaratskhelia</li>
      <li>Di Lorenzo</li>
    </ul>

    <h3>Lazio</h3>
    <ul>
      <li>Immobile</li>
      <li>Zaccagni</li>
      <li>Luis Alberto</li>
    </ul>
  `
};

function showInfo(match) {
  document.getElementById("players").innerHTML = data[match];
}
