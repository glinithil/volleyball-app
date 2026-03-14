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
        "Authorization": "Bearer sl.u.AGUKTGFLlVErWCcA2n3NMVmLq_mGMgqrOL-tswCVlQCvLNjEXgyB7ZLusKC6PrmXjI9n1P5CDYZjIepRS3mekolh_ymgR_iZJsrkFcj1_AXfuLfhqCg2D0AEv8WxhBgAZIutIXYLX9JqhvDeCSzwge9ZsxJ2zXLYBmObNkQpAiXLNLbXroQ9af0Oihuen20gma90yhj5dCRl4CmJMT8lb6YVR6qddDwlBg0xLY4Jio3aQC_6y2HzniTcnyy2Dna-DveX7Jzb6G4R8Mt29WMPeqacZUHNGKPjhxm_XWq1PR8VHsfmL7RMcRzK2uQsl3CU16afJJAoBphN5piWc_B8VbZt2ZDeysoMRk_vTlafHkiMhlNxvQUAIo50CHTlVi28aMINy6O1d2p9ArWdIDAwm0H2PrSERpGtpzfzzhmmm_vmX3095ET5jRKZOhelNeuTSxGG7XBUImny3nVQM4XOJKPVRKcElKv81QuI9ORk-fAvs-rUCDx7-VDYsPjjJrpib3BIR35OSVTW7O7d-aWukrBxmHyWTOh_Y1XDJYnBHbHleP-QD5v5Gn_TzmgVOm1DxJgkjgcZ_VRAJlhP6oJvJ2f1iCnSqMSl2YoGwZD5cGlcm6VMx0DlvwY1_hcmFhuXv79dMCJ7gxKMYVyjHIXgRKMfXGwaqQxJv1UBfmv1yXuCgZ9GLSFDuxKqwHClYypfeUO3lHW6Mc52qT20iyzu-z56PCbOnq8cliwJd0YXQmCJwuKnFCG_InjRdJPyiyX3hkOsGmffjYyPGPAJwyMP0uBfbwGFbDVYjSRrosdClFV9oHht2xcFQeQlkx7AIixxlsdn5m1SGG28BiZLF8g612WFI4EbkkWH-NMED-hdN49Vi5dHLsmc7mbFBRqxp2FO9Qlq6JWY1ks8xBxME-BUPcHZmlUkUD1oORTr23EZOVJ5mtYxQwoYU87IIncyqPFEIvfPQ7-paTxPXCH9KKwZzkg-a-ryH8GESKLPV4hER3sVbbX7PkSjbEKkvfa05MLF3CQYIDE9im6FHgrh7Ln7l_x2k_Lsveri4rYYpJLBgTRwE67t78f4Yz62a7EbpSn7Z3c7BwoYIbhmgJBiKfWATb6pCtKm2TVLRhWUGt-nRuDRu0OeU-vp0x-KC4UiRSVOT9rAFKqWk_HHwWd6OdXwfGr08cvlvQl5pDUBVgrRXfdPgcauWenlsaVQaZzJavK1YJodD90738VfC_NYt0Fu_lckUSTsa8uBZa3wLRlYGjj8MnB3R-ljqGmHrlbCYanMbxReVTLvYLm3YietD52QC0FF",
        "Dropbox-API-Arg": JSON.stringify({
          path: `/Apps/Volleyball_App/Spieltage_Rohdaten/${dateiname}`
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
      "Authorization": "Bearer sl.u.AGUKTGFLlVErWCcA2n3NMVmLq_mGMgqrOL-tswCVlQCvLNjEXgyB7ZLusKC6PrmXjI9n1P5CDYZjIepRS3mekolh_ymgR_iZJsrkFcj1_AXfuLfhqCg2D0AEv8WxhBgAZIutIXYLX9JqhvDeCSzwge9ZsxJ2zXLYBmObNkQpAiXLNLbXroQ9af0Oihuen20gma90yhj5dCRl4CmJMT8lb6YVR6qddDwlBg0xLY4Jio3aQC_6y2HzniTcnyy2Dna-DveX7Jzb6G4R8Mt29WMPeqacZUHNGKPjhxm_XWq1PR8VHsfmL7RMcRzK2uQsl3CU16afJJAoBphN5piWc_B8VbZt2ZDeysoMRk_vTlafHkiMhlNxvQUAIo50CHTlVi28aMINy6O1d2p9ArWdIDAwm0H2PrSERpGtpzfzzhmmm_vmX3095ET5jRKZOhelNeuTSxGG7XBUImny3nVQM4XOJKPVRKcElKv81QuI9ORk-fAvs-rUCDx7-VDYsPjjJrpib3BIR35OSVTW7O7d-aWukrBxmHyWTOh_Y1XDJYnBHbHleP-QD5v5Gn_TzmgVOm1DxJgkjgcZ_VRAJlhP6oJvJ2f1iCnSqMSl2YoGwZD5cGlcm6VMx0DlvwY1_hcmFhuXv79dMCJ7gxKMYVyjHIXgRKMfXGwaqQxJv1UBfmv1yXuCgZ9GLSFDuxKqwHClYypfeUO3lHW6Mc52qT20iyzu-z56PCbOnq8cliwJd0YXQmCJwuKnFCG_InjRdJPyiyX3hkOsGmffjYyPGPAJwyMP0uBfbwGFbDVYjSRrosdClFV9oHht2xcFQeQlkx7AIixxlsdn5m1SGG28BiZLF8g612WFI4EbkkWH-NMED-hdN49Vi5dHLsmc7mbFBRqxp2FO9Qlq6JWY1ks8xBxME-BUPcHZmlUkUD1oORTr23EZOVJ5mtYxQwoYU87IIncyqPFEIvfPQ7-paTxPXCH9KKwZzkg-a-ryH8GESKLPV4hER3sVbbX7PkSjbEKkvfa05MLF3CQYIDE9im6FHgrh7Ln7l_x2k_Lsveri4rYYpJLBgTRwE67t78f4Yz62a7EbpSn7Z3c7BwoYIbhmgJBiKfWATb6pCtKm2TVLRhWUGt-nRuDRu0OeU-vp0x-KC4UiRSVOT9rAFKqWk_HHwWd6OdXwfGr08cvlvQl5pDUBVgrRXfdPgcauWenlsaVQaZzJavK1YJodD90738VfC_NYt0Fu_lckUSTsa8uBZa3wLRlYGjj8MnB3R-ljqGmHrlbCYanMbxReVTLvYLm3YietD52QC0FF",
      "Dropbox-API-Arg": JSON.stringify({
        path: `/Apps/Volleyball_App/Spieltage_Rohdaten/${dateiname}`,
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
