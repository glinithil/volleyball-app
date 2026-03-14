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
  console.log("ladeDropboxDatei wurde aufgerufen:", dateiname);
  try {
    const response = await fetch("https://content.dropboxapi.com/2/files/download", {
      method: "POST",
      headers: {
        "Authorization": "Bearer sl.u.AGVDT4i2vpQmM1YFczSrBNR-EBC-57wrpfnC9WNeiXSNbImDWhztnq03ZURlGoDEamK5Xu-JmbjWwmJDqf5KmyAHputWgB_W1OUKXoCkOMpNJo526iUa-1-GgGYp_73d0AxDOckoE8teOfCr-MmIakHzBhwQ7mwf1N_fiDrQ5sr699Yc5fii8ghSCEjKkItKfDEVqU7yzGzZQGp_79uM-9we_5MSzCfvj8atXP6GeHcPzRsIRTfltDF8v1ccEZpT9Y-vT6QBkCeAQ2bU8LiAUfb0I4bhtIRmEn8ukZf1ps9jCRYyglZMJRpRQU78OuWW5N_s-G-J6jnWKVGnSgzDIYGTHFGwOu15zVEbn5N_1LcT1_Lv6ANcc2-RvoPJ4KGt2XYSUAIT-ElzzhRG-Nqes5nspgZV8GQUpCrSUCrvisQtLEYalinzWoj3zFT40j3gcGIUwVL-CCNUbOOJR-39hxDq45-nXg6ZW4stQZy9qOuWM2jS5guGdiGJTqTpmZ_qRYyg2cPeIZAcBg11jCIOw2MeTPRXf6c63x78d1ItCMuza-8gIdcc6no1SsM5WlEC_ksXM5hJf_nf8UalQ3oFCGsdTbPORlgkdiCXO8fJo_9hJXoxfqoZKFxY8b1y2gxgRl_-5RwGuOxz64bPZQNPkCY0PqDwwfVGRp8nO_N5wePsLEP-BrOp03cPR_so5UXP75nUW07Q9j7NTZav5wJY1Oq6uMywGkawAGH6Mm4gRM-edzSEsuiKcNGzQX4wVBdZQyuYkG2MwQDIVlCPJzyeJsroSrxR353klt_THzF0MnNcIiWHgmqHNELWvh38jyiYsnBBnRZgIKLH6ZF-JF7wEfVHvzRlzCTUSXuHk8R34FcuhsCmHPUqk6QCHdaDflTLMTP9AMJhH4LftXOb5yJNIDYKCz7RR7jFLTQFs7TfcrSF_yfNCyixMg-txfKP_4_XYkEI6SBdXzOjlkzt2ByJOLOwZ-hwNx08IZiHXnw69MB-T_XpPuzWIxSVkf-x7ss_DrIDg1c9xL3kL6dwttWe3oNx48j31Zo4QForBzlAqVxLb8DxNJUsI6u35o1XnmRGxiZ2c7qwot2yojIP-nBUxOZtjZ1GbmSJbv-wxI23q6xRSEoxfsTZFEDLYlZKtCqUJu1IdZonXoLgGkpmxzh5Na6W12YtI3aNixdpy2Y13m57KF5pGygMKj-14tBvoxu1lNf0ffuyKYn359wjrgU0lFfN9Tn_X-JsNuBwbTb_-LWK3RIcLrb6gU8F88Qe68CfknaaQcO9-zS7A7d3zLqWw95s",
        "Dropbox-API-Arg": JSON.stringify({
          path: `/Volleyball/Spieltage Rohdaten/${dateiname}`
        })
      }
    });

    if (!response.ok) return null;

    const text = await response.text();
    return JSON.parse(text);

  } catch (e) {
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
      "Authorization": "Bearer sl.u.AGVDT4i2vpQmM1YFczSrBNR-EBC-57wrpfnC9WNeiXSNbImDWhztnq03ZURlGoDEamK5Xu-JmbjWwmJDqf5KmyAHputWgB_W1OUKXoCkOMpNJo526iUa-1-GgGYp_73d0AxDOckoE8teOfCr-MmIakHzBhwQ7mwf1N_fiDrQ5sr699Yc5fii8ghSCEjKkItKfDEVqU7yzGzZQGp_79uM-9we_5MSzCfvj8atXP6GeHcPzRsIRTfltDF8v1ccEZpT9Y-vT6QBkCeAQ2bU8LiAUfb0I4bhtIRmEn8ukZf1ps9jCRYyglZMJRpRQU78OuWW5N_s-G-J6jnWKVGnSgzDIYGTHFGwOu15zVEbn5N_1LcT1_Lv6ANcc2-RvoPJ4KGt2XYSUAIT-ElzzhRG-Nqes5nspgZV8GQUpCrSUCrvisQtLEYalinzWoj3zFT40j3gcGIUwVL-CCNUbOOJR-39hxDq45-nXg6ZW4stQZy9qOuWM2jS5guGdiGJTqTpmZ_qRYyg2cPeIZAcBg11jCIOw2MeTPRXf6c63x78d1ItCMuza-8gIdcc6no1SsM5WlEC_ksXM5hJf_nf8UalQ3oFCGsdTbPORlgkdiCXO8fJo_9hJXoxfqoZKFxY8b1y2gxgRl_-5RwGuOxz64bPZQNPkCY0PqDwwfVGRp8nO_N5wePsLEP-BrOp03cPR_so5UXP75nUW07Q9j7NTZav5wJY1Oq6uMywGkawAGH6Mm4gRM-edzSEsuiKcNGzQX4wVBdZQyuYkG2MwQDIVlCPJzyeJsroSrxR353klt_THzF0MnNcIiWHgmqHNELWvh38jyiYsnBBnRZgIKLH6ZF-JF7wEfVHvzRlzCTUSXuHk8R34FcuhsCmHPUqk6QCHdaDflTLMTP9AMJhH4LftXOb5yJNIDYKCz7RR7jFLTQFs7TfcrSF_yfNCyixMg-txfKP_4_XYkEI6SBdXzOjlkzt2ByJOLOwZ-hwNx08IZiHXnw69MB-T_XpPuzWIxSVkf-x7ss_DrIDg1c9xL3kL6dwttWe3oNx48j31Zo4QForBzlAqVxLb8DxNJUsI6u35o1XnmRGxiZ2c7qwot2yojIP-nBUxOZtjZ1GbmSJbv-wxI23q6xRSEoxfsTZFEDLYlZKtCqUJu1IdZonXoLgGkpmxzh5Na6W12YtI3aNixdpy2Y13m57KF5pGygMKj-14tBvoxu1lNf0ffuyKYn359wjrgU0lFfN9Tn_X-JsNuBwbTb_-LWK3RIcLrb6gU8F88Qe68CfknaaQcO9-zS7A7d3zLqWw95s",
      "Dropbox-API-Arg": JSON.stringify({
        path: `/Volleyball/Spieltage Rohdaten/${dateiname}`,
        mode: "overwrite"
      }),
      "Content-Type": "application/octet-stream"
    },
    body: inhalt
  });
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
