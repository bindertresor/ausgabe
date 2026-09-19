// Über den Bindertresor (19.09.2026). Aufruf aus Über.md: await dv.view("Skripte/seite-ueber");
//
// Warum es diese Seite gibt (Marks Auftrag): Ohne eigene App gibt es keinen Ort, an dem ein
// Käufer nachsieht, welchen Stand er hat, was das Ding eigentlich macht und wohin er
// schreibt, wenn etwas kaputt ist. Alles drei steht hier - und die Fassungsnummer kommt aus
// window.ksVersion in rahmen.js, nicht aus einer zweiten Zahl, die veralten kann.
await dv.view("Skripte/rahmen");

const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const POST = "kontakt@bindertresor.de";

// Hier standen bis zum 19.09.2026 drei Kacheln: Fassung, Größe der Sammlung, Karten mit
// Kennung. Marks Wort: „raus damit, hat null verloren." Er hat recht - die Fassung steht
// schon in der Überschrift, und wie groß seine Sammlung ist, sieht er auf jeder anderen
// Seite. Eine Seite, die erklärt, erklärt; sie zählt nicht.

const block = (titel, zeilen) => `<div class="ks-flaeche">
  <div class="ks-flaeche__kopf"><span class="ks-flaeche__titel">${esc(titel)}</span></div>
  <div class="ks-ueber__text">${zeilen.map((z) => `<p>${z}</p>`).join("")}</div>
</div>`;

const html = `<div class="ks-seite">
  ${window.ksNaviHtml("Über.md")}
  <div class="ks-seite__inhalt">
    <div class="ks-kopf">
      <div><div class="ks-kopf__label">Bindertresor · Über</div>
        <div class="ks-kopf__titel">${esc(window.ksAusgabe())}</div></div>
    </div>

    ${block("Was der Bindertresor ist", [
      // Der erste Satz sagt, was verkauft wurde (Marks Sorge 19.09.2026: "nicht dass
      // irgendein verdrehter rechtsanwalt der meinung ist ich verkaufe eine app").
      // Ein Leitfaden mit Vorlage ist etwas anderes als eine Software, und wer so spricht,
      // wird auch so gelesen.
      "<strong>Der Bindertresor ist ein Leitfaden mit einer fertigen Vorlage für Obsidian.</strong> Kein Programm, keine App.",
      "Deine Sammlung liegt als ganz normale Dateien in diesem Ordner - eine Notiz je Karte. Alles, was du hier siehst, rechnet sich bei jedem Öffnen daraus aus: Gesamtwert, Set-Fortschritt, Erfolge. Es gibt keine Datenbank und kein Konto.",
      "Das heißt auch: <strong>Die Sammlung gehört dir.</strong> Du kannst den Ordner kopieren, sichern oder mitnehmen; er funktioniert ohne dieses Werkzeug weiter, weil in jeder Notiz lesbarer Text steht.",
    ])}

    ${block("Woher die Preise kommen", [
      // ACHTUNG: In dieser Datei stehen deutsche Anfuehrungszeichen im Text. Das schliessende
      // sieht aus wie ein gewoehnliches " und beendet einen "..."-String mitten im Satz -
      // Saetze mit Anfuehrungszeichen stehen deshalb in Backticks (19.09.2026 passiert).
      // Hier stand bis 19.09.2026 "Preise und Kartenbilder holt der Knopf ..." (Durchgang 20,
      // Befund 7) - und drei Saetze weiter unten "die Kartenbilder kommen beim Anzeigen".
      // Gemessen, was der Knopf wirklich tut (rahmen.js, ksPreislaufArbeit): Er schreibt die
      // ADRESSE des Bildes in die Notiz, wo noch keine steht. Die Datei selbst liegt bei
      // TCGdex und wird bei jedem Anzeigen von dort geladen. Ein Satz im Datenschutz-
      // Abschnitt, der etwas anderes sagt als der Abschnitt "Rechtliches", ist einer zu viel.
      `Die Preise holt der Knopf <strong>„Jetzt aktualisieren“</strong> auf dem Dashboard von <strong>TCGdex</strong>, einer offenen Kartendatenbank; wo noch kein Kartenbild hinterlegt ist, merkt er sich dabei dessen Adresse. Die Preise stammen von <strong>Cardmarket</strong>.`,
      "Der Wert einer Karte ist der <strong>kleinste der vier Cardmarket-Schnitte</strong> (Tag, 7 Tage, 30 Tage, Trend) - ein einzelner Ausreißer nach oben trifft nie alle vier zugleich. Trägst du bei einem Exemplar einen eigenen Wert ein, gilt deiner.",
      // Diese drei Sätze standen am 19.09.2026 zuerst als EIN Satz da: „Hinaus geht dabei nur
      // die Kartenkennung." Marks Frage „stimmt das auch wirklich?" und die Messung danach:
      // Er stimmte nicht. Die Kartenbilder liegen auf assets.tcgdex.net und werden bei jedem
      // Öffnen von dort geladen (63 von 63 Notizen), und die Suche schickt Name, Nummer und
      // Set-Namen. Nur der Preislauf schickt wirklich bloß die Kennung.
      `<strong>Deine Sammlung verlässt deinen Rechner nie.</strong> Nachgeladen werden nur die Kartenbilder - wer das nicht will, legt eigene Fotos ab.`,
      `Im Einzelnen: Beim Preise-Holen geht die Kartenkennung hinaus, beim Suchen dein Suchbegriff, und die Kartenbilder kommen beim Anzeigen von TCGdex. Dein Bestand, deine Werte, deine Kaufpreise, deine Verkäufe und deine Notizen bleiben hier.`,
    ])}

    ${(() => {
      // Bis zum 19.09.2026 stand hier: "Der Bindertresor hat keine Update-Funktion, und das
      // ist Absicht: Er ist ein Ordner, kein Programm." Dazu die Bitte, die Nummer oben von
      // Hand mit der auf bindertresor.de zu vergleichen. Marks Entscheidung an dem Tag:
      // "kann mir kaum vorstellen das leute staendig irgendwo was runterladen und dann
      // selber installieren wollen" - also melden UND auf Knopfdruck holen.
      //
      // Ein Ordner bleibt es trotzdem, und der Satz darueber sagt weiter, was passiert und
      // was nicht. Der Unterschied zu einer Software, die sich selbst aktualisiert: Hier
      // drueckt ein Mensch, und ohne Netz aendert sich gar nichts.
      return `<div class="ks-flaeche">
  <div class="ks-flaeche__kopf"><span class="ks-flaeche__titel">Was Updates angeht</span>
    <span class="ks-kopf__label">${esc(window.ksAusgabe())}</span></div>
  <div class="ks-ueber__text">
    <p>Eine neue Ausgabe ersetzt die Dateien im Ordner <strong>Skripte</strong> - <strong>deine Karten, Fotos und der Wertverlauf bleiben unberührt.</strong> Die bisherige Ausgabe wird vorher vollständig gesichert.</p>
    <p>Korrekturen bekommst du kostenlos. Der Knopf sieht auf <strong>bindertresor.de</strong> nach, ob es etwas Neues gibt; dabei wird nichts über dich oder deine Sammlung gesendet. Ohne Internet bleibt alles, wie es ist.</p>
  </div>
  <div class="ks-ueber__ausgabe" data-ausgabe-stand></div>
  <div class="ks-karte__fuss" style="justify-content:flex-start">
    <button type="button" class="ks-knopf" data-befehl="ausgabe-pruefen">Nach einer neuen Ausgabe sehen</button>
  </div>
</div>`;
    })()}

    ${block("Etwas funktioniert nicht?", [
      // Hier stand bis 19.09.2026 "nenne die Fassung oben (1.0.0)" (Durchgang 20, Befund 2).
      // Seit dem 19.09.2026 hat die Fassung nur noch zwei Stellen (siehe rahmen.js). Damit
      // nennt dieser Satz dieselbe Zahl, die oben im Kopf und unten in der Navi steht -
      // vorher standen dort "Ausgabe 1.0" und hier "1.0.1", und das sah aus wie ein Fehler.
      // Das Wort "volle" ist entfallen: Es gibt keine kurze und keine lange Nummer mehr.
      // Und es heisst "Ausgabe", nicht "Fassungsnummer" (19.09.2026, Marks Frage "warum
      // nennst du es fassung und nicht ausgabe?"): In der Oberflaeche steht ueberall
      // "Ausgabe", ein zweites Wort fuer dieselbe Sache ist eines zu viel.
      `Schreib an <strong>${esc(POST)}</strong> und nenne die Ausgabe <strong>${esc(window.ksVersion)}</strong> sowie die Seite, auf der es passiert ist.`,
      "Hilfreich ist ein Bildschirmfoto. Steht irgendwo eine Fehlermeldung, öffne mit <strong>Strg + Umschalt + I</strong> (Mac: <strong>Cmd + Alt + I</strong>) die Entwicklerkonsole und schick den roten Text mit - dort steht der Grund.",
    ])}

    ${block("Rechtliches", [
      "Pokémon und alle Kartennamen sind Marken von Nintendo, Creatures Inc. und GAME FREAK. Der Bindertresor gehört nicht zu diesen Unternehmen und wird von ihnen weder betrieben noch unterstützt.",
      // Derselbe Hinweis, den kommerzielle Seiten dieser Branche im Fuß führen - gemessen
      // 19.09.2026 an tcgindex.io: „All trademarks and card images are property of their
      // respective owners", und auch dort kommen die Kartenbilder vom CDN des Anbieters,
      // nicht aus deren eigenem Bestand.
      "<strong>Alle Marken und Kartenbilder gehören ihren jeweiligen Eigentümern.</strong> Die Bilder werden beim Anzeigen von <strong>TCGdex</strong> geladen und sind nicht Teil dieses Produkts.",
      // Die Namensnennung ist Pflicht, nicht Höflichkeit: TCGdex stellt seine Inhalte unter
      // CC BY-SA 4.0 (tcgdex.net/terms-and-conditions, § 5), und das „BY" verlangt sie.
      "Kartendaten und Bilder stammen von <strong>TCGdex</strong> (tcgdex.net) und stehen dort unter der Lizenz <strong>CC BY-SA 4.0</strong>; die Preise kommen von <strong>Cardmarket</strong>.",
    ])}
  </div>
</div>`;

// „2026-09-19" ist Maschinenschreibweise. Der Vault zeigt Daten sonst überall deutsch
// (window.ksJetzt, dmz in seite-dashboard.js), und hier stand sie als Einzige roh da.
const datumDeutsch = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? ""));
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "";
};

// Zeigt den Stand unter den beiden Absätzen. `art` steuert nur die Farbe.
const standHtml = (art, text, knopf = "") =>
  `<div class="ks-ausgabe ks-ausgabe--${art}"><span>${text}</span>${knopf}</div>`;

window.ksRahmen(dv, {
  html,
  hoehe: "calc(100vh - 144px)",

  // Beim Öffnen der Seite wird EINMAL still nachgesehen. Schlägt es fehl - kein Netz, Server
  // weg, kaputte Antwort -, bleibt die Zeile leer und der Knopf steht bereit. Kein roter
  // Kasten, keine Fehlermeldung: Ein Leitfaden, der sich über sein eigenes Update beschwert,
  // ist kaputter als einer, der keines findet.
  fertig: async (dok) => {
    const platz = dok.querySelector("[data-ausgabe-stand]");
    if (!platz) return;
    const stand = await window.ksAusgabePruefen();
    if (!stand) return;
    if (stand.neuer) {
      const neu = stand.neu.length
        ? `<ul>${stand.neu.map((z) => `<li>${esc(z)}</li>`).join("")}</ul>` : "";
      platz.innerHTML = standHtml("neu",
        `<strong>Ausgabe ${esc(stand.ausgabe)} ist da.</strong>${datumDeutsch(stand.datum) ? ` Vom ${esc(datumDeutsch(stand.datum))}.` : ""}${neu}`,
        `<button type="button" class="ks-knopf" data-befehl="ausgabe-holen">Jetzt holen</button>`);
    } else {
      platz.innerHTML = standHtml("aktuell", "Du hast die neueste Ausgabe.");
    }
  },

  befehl: async (name, el, dok) => {
    const platz = dok.querySelector("[data-ausgabe-stand]");
    if (!platz) return;

    if (name === "ausgabe-pruefen") {
      el.disabled = true;
      const alterText = el.textContent;
      el.textContent = "Sehe nach …";
      const stand = await window.ksAusgabePruefen();
      el.disabled = false;
      el.textContent = alterText;
      if (!stand) {
        platz.innerHTML = standHtml("still",
          "Konnte nicht nachsehen. Entweder ist gerade kein Internet da, oder der Server antwortet nicht - deine Sammlung ist davon nicht betroffen.");
        return;
      }
      if (!stand.neuer) { platz.innerHTML = standHtml("aktuell", "Du hast die neueste Ausgabe."); return; }
      const neu = stand.neu.length ? `<ul>${stand.neu.map((z) => `<li>${esc(z)}</li>`).join("")}</ul>` : "";
      platz.innerHTML = standHtml("neu",
        `<strong>Ausgabe ${esc(stand.ausgabe)} ist da.</strong>${datumDeutsch(stand.datum) ? ` Vom ${esc(datumDeutsch(stand.datum))}.` : ""}${neu}`,
        `<button type="button" class="ks-knopf" data-befehl="ausgabe-holen">Jetzt holen</button>`);
      return;
    }

    if (name === "ausgabe-holen") {
      const stand = await window.ksAusgabePruefen();
      if (!stand || !stand.neuer) {
        platz.innerHTML = standHtml("still", "Es gibt gerade nichts zu holen.");
        return;
      }
      // Kein window.confirm: Die Rückfrage gehört zur Oberfläche (Marks Wort 19.09.2026).
      const ja = await window.ksFrage(dok,
        `Ausgabe ${stand.ausgabe} holen? ${stand.dateien.length} Dateien im Ordner Skripte werden ersetzt. Die bisherige Ausgabe wird vorher nach Skripte/_vorher-${window.ksVersion} gesichert. Deine Karten, Fotos und der Wertverlauf werden nicht angefasst.`,
        "Ja, holen");
      if (!ja) return;

      el.disabled = true;
      try {
        const erg = await window.ksAusgabeHolen(stand, (satz) => {
          platz.innerHTML = standHtml("laeuft", esc(satz));
        });
        platz.innerHTML = standHtml("aktuell",
          `<strong>Ausgabe ${esc(stand.ausgabe)} ist da.</strong> ${erg.anzahl} Dateien ersetzt, die bisherige Ausgabe liegt in <strong>${esc(erg.sicherung)}</strong>. Lade Obsidian jetzt neu - <strong>Strg + R</strong> (Mac: <strong>Cmd + R</strong>) -, damit sie greift.`);
      } catch (e) {
        // Hier darf es laut werden: Der Kaeufer hat gedrueckt und wartet auf eine Antwort.
        // Die Rohmeldung kommt mit, sie steht sonst nur in der Konsole.
        platz.innerHTML = standHtml("still",
          `Das hat nicht geklappt: ${esc(e?.message ?? String(e))}. Es wurde nichts geändert - deine Sammlung und die bisherige Ausgabe sind unberührt.`);
        el.disabled = false;
      }
    }
  },
});
