/* -----------------------------------------
   1. Spielerliste
----------------------------------------- */

const alleSpieler = [
  "Timo", "Leonie", "Alex", "Jan", "Wiebke", "Benny",
  "Munzi", "Franz", "Raphael", "Anton", "JP", "Kevin",
  "Thilo", "Poly", "Anne", "Anja", "Marcel", "Kerstin",
  "Gast 1", "Gast 2", "Normalo 1", "Normalo 2", "Profi 1", "Profi 2"
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
   10. JSON für EIN Spiel erzeugen
----------------------------------------- */

function generiereSpielJSON() {
  const uhrzeit = document.getElementById("uhrzeit").value;
  const ort = document.getElementById("ort").value;
  const umDie = Number(document.querySelector("input[name='umDie']:checked")?.value || 0);

  const spieler = sammleSpieler();
  const saetze = aktuellesSpiel.saetze;

  return {
    uhrzeit,
    ort,
    umDie,
    spieler,
    saetze
  };
}


/* -----------------------------------------
   11. Dropbox: Datei laden
----------------------------------------- */

async function ladeDropboxDatei(dateiname) {
  try {
    const response = await fetch("https://content.dropboxapi.com/2/files/download", {
      method: "POST",
      headers: {
        "Authorization": "Bearer sl.u.AGV47nox4z-zByL_PD_S6-a54iIF7oZ6xK5gB8XADN89sJcYi8VpPhjwmsLe-vE5viTYs2cbvzmafHeOj8_6oty48fvIDszvfE35PkDpEH5XPeCZY5b-PV_ME-dF--R4lhW13ogGMsQsn1cK_rpymgw6U6iOcuMWquXjHNUVFk1BaOo4Cu6qaOfLlI-b1Rsj3az8YBDf1iOp-ayyUF_Mlv_uo_5vc5IYkGQrTdHyy9L-rljclvqH_vrDnd2JEarnJDHu1zkG-YW0SxXSa6hcBMM9L1_H_-LYIzb0ULU4gXdzDiC5T-YjilFiYF3MkxgFwO8IHjPfcM9Q76oCAt97SwwzkMe2M4mu1c7jPaQ61xUY835JIVI4g04-BYJkmt92H2zrgJSkHlDVjuKF9ksBiPga8k6qLtNgefoajsjRpjqoHD7S3u9YRivBKEOTy8YPgrq8L8mX9QeroBcEGnN0F1xMacvP18h-N4yjv6UyaLpPBMEXfnLyv8mLEPem6hGnuhlBUBlikDtP6ZSRZrR8Sx3aS-ABaCfYw_X9ja7NhzOtL_Uh18152bizWbecSN5UVd2el5ZUzMP-w_1arvMWvkPV-vt-bM2h-QhHK-X-aNkVeGW7hAZCrTszeIxeNxT7r23It2SnkQHVt-vAYmF477Dd8JTtcfrAtAtKmATy6GL2xMF8vaanNDn2Q9AnjOsoy_OKLcpWTAYITA_aGE5beNwUE3nH1XaLveLEtUlMLxlOvctiLM_08F9YZhtc1ooHoa7ZxFpwWTFi1h9Wr8bEspLcFzMc9u-e9lS8dfxLCGAJTbSRoyD_PsSVmLgNs5AU2KX4-oUg6EfVzfKs9XDEAGPzPbtcsoObcgcVyYINKaCcHKXCDNZm53ug9llvB0ewd01ZF6jBmAywO6pT5etlyWBoMet4ArcRTxudWQUU99Usc2vT40gORBMPyC2ZjJluvsTt1cM4Nxesw7YT3TK-AtvEILqIivWGJo3bM_34va1WqE4juIgr53BkllTT407owme9fZ6yWGlSRmu7PFYI8hrSMwDcOIY61g-Sk6Ipe5Xcizw7p4-O9f4nOgosy3DpHFT64quZOK4B1uU5Z-chrRzpIpS0vdXTRgBGkaQDyX2qtZ2zM_BDV8sC2lyrfR837Uv1BivUd4Mdwkyf_qw9vfRya_x9pQ9her7njhqsAA5KGUW42vM528hEAXaWyfL4WINN_AQYI3UGNdii955QBt2l-TnjkP8nRGbpuyijOFUj5tS1ozQKb11Mh3aw-UJwDGuW0yLywJGH-wnefMOHVVed",
        "Dropbox-API-Arg": JSON.stringify({
          path: `/Volleyball/Spieltage_Rohdaten/${dateiname}`
        })
      }
    });

    if (response.status === 409) {
      console.log("Datei existiert noch nicht – wird neu erstellt.");
      return null;
    }

    if (!response.ok) {
      console.log("Dropbox Download Fehler:", response.status);
      return null;
    }

    const text = await response.text();
    return JSON.parse(text);

  } catch (e) {
    console.log("Dropbox Download Exception:", e);
    return null;
  }
}

/* -----------------------------------------
   12. Dropbox: Datei speichern
----------------------------------------- */

async function speichereDropboxDatei(dateiname, inhalt) {
  console.log("speichereDropboxDatei wurde aufgerufen:", dateiname);

  return fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: {
      "Authorization": "Bearer sl.u.AGV47nox4z-zByL_PD_S6-a54iIF7oZ6xK5gB8XADN89sJcYi8VpPhjwmsLe-vE5viTYs2cbvzmafHeOj8_6oty48fvIDszvfE35PkDpEH5XPeCZY5b-PV_ME-dF--R4lhW13ogGMsQsn1cK_rpymgw6U6iOcuMWquXjHNUVFk1BaOo4Cu6qaOfLlI-b1Rsj3az8YBDf1iOp-ayyUF_Mlv_uo_5vc5IYkGQrTdHyy9L-rljclvqH_vrDnd2JEarnJDHu1zkG-YW0SxXSa6hcBMM9L1_H_-LYIzb0ULU4gXdzDiC5T-YjilFiYF3MkxgFwO8IHjPfcM9Q76oCAt97SwwzkMe2M4mu1c7jPaQ61xUY835JIVI4g04-BYJkmt92H2zrgJSkHlDVjuKF9ksBiPga8k6qLtNgefoajsjRpjqoHD7S3u9YRivBKEOTy8YPgrq8L8mX9QeroBcEGnN0F1xMacvP18h-N4yjv6UyaLpPBMEXfnLyv8mLEPem6hGnuhlBUBlikDtP6ZSRZrR8Sx3aS-ABaCfYw_X9ja7NhzOtL_Uh18152bizWbecSN5UVd2el5ZUzMP-w_1arvMWvkPV-vt-bM2h-QhHK-X-aNkVeGW7hAZCrTszeIxeNxT7r23It2SnkQHVt-vAYmF477Dd8JTtcfrAtAtKmATy6GL2xMF8vaanNDn2Q9AnjOsoy_OKLcpWTAYITA_aGE5beNwUE3nH1XaLveLEtUlMLxlOvctiLM_08F9YZhtc1ooHoa7ZxFpwWTFi1h9Wr8bEspLcFzMc9u-e9lS8dfxLCGAJTbSRoyD_PsSVmLgNs5AU2KX4-oUg6EfVzfKs9XDEAGPzPbtcsoObcgcVyYINKaCcHKXCDNZm53ug9llvB0ewd01ZF6jBmAywO6pT5etlyWBoMet4ArcRTxudWQUU99Usc2vT40gORBMPyC2ZjJluvsTt1cM4Nxesw7YT3TK-AtvEILqIivWGJo3bM_34va1WqE4juIgr53BkllTT407owme9fZ6yWGlSRmu7PFYI8hrSMwDcOIY61g-Sk6Ipe5Xcizw7p4-O9f4nOgosy3DpHFT64quZOK4B1uU5Z-chrRzpIpS0vdXTRgBGkaQDyX2qtZ2zM_BDV8sC2lyrfR837Uv1BivUd4Mdwkyf_qw9vfRya_x9pQ9her7njhqsAA5KGUW42vM528hEAXaWyfL4WINN_AQYI3UGNdii955QBt2l-TnjkP8nRGbpuyijOFUj5tS1ozQKb11Mh3aw-UJwDGuW0yLywJGH-wnefMOHVVed",
      "Dropbox-API-Arg": JSON.stringify({
        path: `/Volleyball/Spieltage_Rohdaten/${dateiname}`,
        mode: "overwrite"
      }),
      "Content-Type": "application/octet-stream"
    },
    body: inhalt // MUSS ein String oder Blob sein
  })
  .then(r => r.text().then(t => console.log("Dropbox Upload Antwort:", r.status, t)));
}


/* -----------------------------------------
   13. Spiel in Spieltag einfügen
----------------------------------------- */

async function fuegeSpielZuSpieltagHinzu(spiel) {
  const datum = document.getElementById("datum").value;
  const dateiname = `spieltag_${datum}.json`;

  let spieltagJSON = await ladeDropboxDatei(dateiname);

  if (!spieltagJSON) {
    spieltagJSON = {
      datum,
      spiele: []
    };
  }

  spieltagJSON.spiele.push(spiel);

  await speichereDropboxDatei(dateiname, JSON.stringify(spieltagJSON, null, 2));

  console.log("Spieltag-Datei aktualisiert:", spieltagJSON);
}


/* -----------------------------------------
   14. Spiel beenden
----------------------------------------- */

function spielBeenden() {
  aktuellesSpiel.spieler = sammleSpieler();
  aktuellesSpiel.umDie = Number(document.querySelector("input[name='umDie']:checked")?.value || 0);

  const spielJSON = generiereSpielJSON();
  fuegeSpielZuSpieltagHinzu(spielJSON);

  console.log("Spiel gespeichert:", aktuellesSpiel);

  neuesSpielStarten();
}


/* -----------------------------------------
   15. Neues Spiel starten
----------------------------------------- */

function neuesSpielStarten() {
  aktuellesSpiel = {
    umDie: 0,
    spieler: [],
    saetze: []
  };

  setzeStandardDatumUhrzeit();
  leereSatzEingaben();

  document.querySelectorAll(".team1, .team2").forEach(cb => cb.checked = false);
}


/* -----------------------------------------
   16. Satzfelder leeren
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
   17. Event Listener
----------------------------------------- */

window.addEventListener("DOMContentLoaded", () => {
  baueSpielerListe();
  setzeStandardDatumUhrzeit();

  document.getElementById("btnSpielSpeichern")
    .addEventListener("click", satzSpeichern);
});
