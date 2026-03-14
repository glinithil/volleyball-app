/* -----------------------------------------
   1. Spielerliste
----------------------------------------- */

const alleSpieler = [
  "Timo", "Leonie", "Alex", "Jan", "Wiebke", "Benny",
  "Munzi", "Franz", "Raphael", "Anton", "JP", "Kevin",
  "Thilo", "Poly", "Anne", "Anja", "Marcel", "Kerstin",
  "Gast1", "Gast2", "Normalo 1", "Normalo 2", "Profi 1", "Profi 2"
];

/* -----------------------------------------
   2. Globale Variablen
----------------------------------------- */

let aktuellesSpiel = {
  umDie: 0,
  spieler: [],
  saetze: []
};

let spieleListe = []; // alle Spiele des Tages


/* -----------------------------------------
   3. Spieler in Scrollbox einfügen
----------------------------------------- */

function baueSpielerListe() {
  const box = document.getElementById("spielerBox");
  box.innerHTML = "";

  alleSpieler.forEach(name => {
    const row = document.createElement("div");
    row.classList.add("spieler-row");

    row.innerHTML = `
      <span class="spieler-name">${name}</span>
      <div class="team-checks">
        <label>
          <input type="checkbox" class="team1" data-name="${name}">
          Team 1
        </label>
        <label>
          <input type="checkbox" class="team2" data-name="${name}">
          Team 2
        </label>
      </div>
    `;

    box.appendChild(row);
  });

  aktiviereCheckboxLogik();
}


/* -----------------------------------------
   4. Checkbox-Logik: Nur ein Team pro Spieler
----------------------------------------- */

function aktiviereCheckboxLogik() {
  document.querySelectorAll(".spieler-row").forEach(row => {
    const cb1 = row.querySelector(".team1");
    const cb2 = row.querySelector(".team2");

    cb1.addEventListener("change", () => {
      if (cb1.checked) cb2.checked = false;
    });

    cb2.addEventListener("change", () => {
      if (cb2.checked) cb1.checked = false;
    });
  });
}


/* -----------------------------------------
   5. Datum & Uhrzeit automatisch setzen
----------------------------------------- */

function setzeStandardDatumUhrzeit() {
  const heute = new Date();

  const yyyy = heute.getFullYear();
  const mm = String(heute.getMonth() + 1).padStart(2, "0");
  const dd = String(heute.getDate()).padStart(2, "0");
  document.getElementById("datum").value = `${yyyy}-${mm}-${dd}`;

  const hh = String(heute.getHours()).padStart(2, "0");
  const min = String(heute.getMinutes()).padStart(2, "0");
  document.getElementById("uhrzeit").value = `${hh}:${min}`;
}


/* -----------------------------------------
   6. Spieler einsammeln
----------------------------------------- */

function sammleSpieler() {
  const spieler = [];

  document.querySelectorAll(".spieler-row").forEach(row => {
    const name = row.querySelector(".spieler-name").textContent;
    const team1 = row.querySelector(".team1").checked;
    const team2 = row.querySelector(".team2").checked;

    let team = "";
    if (team1) team = 1;
    if (team2) team = 2;

    spieler.push({ name, team });
  });

  return spieler;
}


/* -----------------------------------------
   7. Sätze einsammeln
----------------------------------------- */

function sammleSaetze() {
  const saetze = [];

  const s1t1 = document.querySelector(".satz1-t1").value;
  const s1t2 = document.querySelector(".satz1-t2").value;
  const s2t1 = document.querySelector(".satz2-t1").value;
  const s2t2 = document.querySelector(".satz2-t2").value;
  const s3t1 = document.querySelector(".satz3-t1").value;
  const s3t2 = document.querySelector(".satz3-t2").value;

  if (s1t1 && s1t2) saetze.push({ team1: Number(s1t1), team2: Number(s1t2) });
  if (s2t1 && s2t2) saetze.push({ team1: Number(s2t1), team2: Number(s2t2) });
  if (s3t1 && s3t2) saetze.push({ team1: Number(s3t1), team2: Number(s3t2) });

  return saetze;
}


/* -----------------------------------------
   8. Satz speichern
----------------------------------------- */

function satzSpeichern() {
  const saetze = sammleSaetze();

  if (saetze.length === 0) {
    alert("Bitte Satzpunkte eingeben.");
    return;
  }

  const letzterSatz = saetze[saetze.length - 1];
  aktuellesSpiel.saetze.push(letzterSatz);

  console.log("Satz gespeichert:", letzterSatz);

  leereSatzEingaben();

  pruefeSpielFortsetzung();
}


/* -----------------------------------------
   9. Prüfen, ob Spiel weitergeht
----------------------------------------- */

function hatTeamZweiSaetze(saetze) {
  let t1 = 0;
  let t2 = 0;

  saetze.forEach(s => {
    if (s.team1 > s.team2) t1++;
    else t2++;
  });

  return (t1 >= 2 || t2 >= 2);
}

function pruefeSpielFortsetzung() {
  if (hatTeamZweiSaetze(aktuellesSpiel.saetze)) {
    spielBeenden();
    return;
  }

  const weiter = confirm("Soll das Spiel weitergehen?");
  if (!weiter) spielBeenden();
}


/* -----------------------------------------
   10. Spiel beenden
----------------------------------------- */

function spielBeenden() {
  aktuellesSpiel.spieler = sammleSpieler();
  aktuellesSpiel.umDie = Number(document.querySelector("input[name='umDie']:checked")?.value || 0);

  spieleListe.push(aktuellesSpiel);

  console.log("Spiel gespeichert:", aktuellesSpiel);

  neuesSpielStarten();
}


/* -----------------------------------------
   11. Neues Spiel starten
----------------------------------------- */

function neuesSpielStarten() {
  aktuellesSpiel = {
    umDie: 0,
    spieler: [],
    saetze: []
  };

  setzeStandardDatumUhrzeit();
  leereSatzEingaben();

  // Teamzuordnungen leeren
  document.querySelectorAll(".team1, .team2").forEach(cb => cb.checked = false);
}


/* -----------------------------------------
   12. Satzfelder leeren
----------------------------------------- */

function leereSatzEingaben() {
  document.querySelector(".satz1-t1").value = "";
  document.querySelector(".satz1-t2").value = "";
  document.querySelector(".satz2-t1").value = "";
  document.querySelector(".satz2-t2").value = "";
  document.querySelector(".satz3-t1").value = "";
  document.querySelector(".satz3-t2").value = "";
}


/* -----------------------------------------
   13. Event Listener
----------------------------------------- */

window.addEventListener("DOMContentLoaded", () => {
  baueSpielerListe();
  setzeStandardDatumUhrzeit();

  document.getElementById("btnSpielSpeichern")
    .addEventListener("click", satzSpeichern);
});
