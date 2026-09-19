// Album im Rahmen (15.09.2026). Aufruf aus Album.md: await dv.view("Skripte/seite-album");
await dv.view("Skripte/rahmen");

const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const leer = (v) => v == null || v === "" || (Array.isArray(v) && !v.length);
// Zahl aus dem Kopfblock: DIE EINE Lesart aus rahmen.js (window.ksZahl) - leer und
// UNLESBAR sind `null`, nie 0. Bis 18.09.2026 stand hier `: 0`, und ein Kopfblock mit
// `preis: "12.50"` (in Anfuehrungszeichen) zeigte "0,00 €", waehrend preise.py 12,50 €
// in Wertverlauf.csv schrieb (Durchgang 17, Befund 2). Die Konstante bleibt stehen,
// damit die Aufrufe unveraendert lesen - sie zeigt nur nicht mehr auf eine eigene Regel.
const zahl = (v) => window.ksZahl(v);
const euro = (n) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
// Suchtext vereinheitlichen: "Mew-ex" und "mew ex" sollen dasselbe finden. Bindestriche
// und Satzzeichen werden zu Leerzeichen, danach wird wortweise gesucht (alle Wörter müssen
// vorkommen, Reihenfolge egal).
const suchbar = (t) => String(t ?? "").toLowerCase()
  .replace(/[-–—_/.,:;()[\]]/g, " ")
  .replace(/\s+/g, " ").trim();

// Chips kommen aus der einen Sprachtabelle in rahmen.js (18.09.2026).
const KUERZEL = Object.fromEntries(Object.entries(window.ksSprachTabelle).map(([k, v]) => [k, v.kurz]));

// Bildquelle kommt aus rahmen.js (window.ksBild) - eine Stelle für alle Seiten, und
// dort hängt auch der Werbemodus (Platzhalter statt Kartenillustration). Das Album gab
// dafür bis 16.09.2026 eine laufende Nummer mit und bekam dadurch für dieselbe Karte ein
// anderes Platzhalterbild als Dashboard und Karten-Ansicht; die Zuordnung steckt jetzt
// vollständig in window.ksPlatzhalter.
const bild = (k) => window.ksBild(k, k.bild, k.file.path);

const karten = dv.pages('"Karten"')
  .map(k => {
    // Wert-Regel nur an einer Stelle: window.ksWert in rahmen.js (Fehlermuster 11)
    const w = window.ksWert(k, leer(k.preis) ? null : zahl(k.preis));
    const wert = !w.stueck || !w.hatWert ? null : w.gesamt;
    // ZWEI Gruende fuer "kein Betrag", und sie sagen Verschiedenes (Durchgang 17,
    // Befund 3): Entweder ist nichts mehr im Bestand (alles verkauft) - oder es ist
    // etwas da, aber niemand kennt seinen Preis. Bis 18.09.2026 fuehrte die Kachel
    // beides zu "kein Preis" zusammen und behauptete das an einer Karte mit 120 €
    // Marktpreis, deren einziges Exemplar verkauft war. Die Karten-Ansicht unterscheidet
    // seit Durchgang 14 ("alle Exemplare verkauft" gegen "noch keinen Preis").
    const nurVerkauft = !w.stueck && w.exemplare.length > 0;
    // ex = die Menge, über die der Grading-Chip gebildet wird: der Bestand, bei vollständig
    // verkaufter Karte deren verkaufte Exemplare (Regel in window.ksWert, rahmen.js).
    // KEIN Durchschnitt mehr (gemeldet 16.09.2026): Die Kachel zeigte `wert / stueck`.
    // Tragen zwei Exemplare verschiedene Werte - 890,00 € gegradet, 236,52 € roh -, stand
    // dort 563,26 €, eine Zahl, die an keinem Exemplar steht, waehrend die Karten-Ansicht
    // einen Klick weiter die echten Einzelwerte zeigt. Jetzt steht die SUMME da (die
    // stimmt immer) mit dem Wort "gesamt" daneben, sobald es mehr als ein Exemplar ist;
    // Einzelwerte stehen in der Karten-Ansicht, wo sie je Exemplar beschriftet sind.
    return { k, ex: w.gezeigte, anzahl: w.stueck, ohnePreis: w.ohnePreis,
             wert, nurVerkauft, src: bild(k),
             // ganz verkauft (graue Kachel, ans Ende sortiert) ...
             verkauft: w.stueck === 0 && w.exemplare.length > 0,
             // ... gegen "hat überhaupt ein verkauftes Exemplar". Beides ist nötig, seit
             // eine Notiz ein verkauftes UND ein vorhandenes Exemplar tragen kann: das
             // Dashboard zählte Exemplare ("Verkauft 1"), das Album nur ganz verkaufte
             // Notizen - der Filter "nur verkauft" blieb daneben leer (gemeldet 15.09.2026).
             verkaufteStueck: w.verkauft };
  }).array()
  // Verkaufte ans Ende, sonst nach Wert
  .sort((a, b) => (a.verkauft - b.verkauft) || ((b.wert ?? -1) - (a.wert ?? -1)));

// Verkauftes zählt nicht mehr zum Bestand
const imBestand = karten.filter(x => !x.verkauft);
const gesamt = imBestand.reduce((s, x) => s + (x.wert ?? 0), 0);
// Traegt keine Karte im Bestand einen Preis, sagt der Kopf "noch kein Preis" wie die Sets-Seite -
// statt harte 0,00 € zu behaupten (gemeldet 15.09.2026). Auslesbar am ersten Tag, bevor
// preise.py gelaufen ist. Die Kachel darunter macht es über "einzel == null" schon so.
const mitWert = imBestand.some(x => x.wert != null);
// Steht auch nur ein Exemplar ohne bekannten Preis im Bestand, ist die Summe eine
// UNTERGRENZE, kein Messwert - sie bekommt "ab" davor (gemeldet 16.09.2026).
const summeUnvollstaendig = imBestand.some(x => x.ohnePreis > 0);
const stueck = imBestand.reduce((s, x) => s + x.anzahl, 0);
// Kein Bestand mehr, aber Karten in der Sammlung: dann fehlt kein Preis, dann ist alles
// verkauft. Bis 18.09.2026 sagte der Kopf in beiden Faellen "noch kein Preis".
const alleVerkauft = imBestand.length === 0 && karten.length > 0;
// Verkauftes zählt je EXEMPLAR, wie die Dashboard-Kachel "Verkauft" - dieselbe
// Beschriftung darf nicht zwei verschiedene Mengen meinen.
const verkauftZahl = karten.reduce((s, x) => s + x.verkaufteStueck, 0);

const sprachen = [...new Set(karten.map(x => x.k.sprache).filter(x => !leer(x)).map(String))].sort();

// `data-stueck` sind die Karten IM BESTAND dieser Kachel - dieselbe Menge, die der Kopf
// summiert und die die Dashboard-Kachel "Karten" zeigt; verkaufte zaehlen nirgends mit.
//
// ACHTUNG: In diesem Block stehen KEINE HTML-Kommentare zwischen den Attributen. Ein
// <!-- --> innerhalb eines Tags beendet es - am 19.09.2026 stand dadurch die halbe
// Attributliste als Text in jeder Kachel und der Filter zaehlte "0 von 0". Kommentare
// gehoeren vor den Block, nicht hinein.
const kacheln = karten.map(({ k, ex, anzahl, ohnePreis, wert, nurVerkauft, src, verkauft, verkaufteStueck }) => `
  <a class="ks-album__karte${verkauft ? " ks-album__karte--verkauft" : ""}" href="#" data-ziel="${esc(k.file.path)}"
     data-such="${esc(suchbar([window.ksKartenName(k), window.ksOriginalName(k), window.ksSetName(k), k.nummer, k.seltenheit].filter(x => !leer(x)).join(" ")))}"
     data-sprache="${esc(k.sprache ?? "")}" data-grading="${ex.some(e => e.grading) ? "ja" : ""}"
     data-roh="${ex.some(e => !e.grading) ? "ja" : ""}"
     data-verkauft="${verkaufteStueck ? "ja" : ""}" data-bestand="${anzahl ? "ja" : ""}" data-wert="${wert ?? 0}"
     data-stueck="${anzahl}"
     data-name="${esc(String(window.ksKartenName(k) ?? k.file.name).toLowerCase())}" data-set="${esc(String(window.ksSetName(k) ?? "").toLowerCase())}">
    <div class="ks-album__bildbox">
      ${src ? `<img class="ks-album__bild" loading="lazy" src="${esc(src)}" alt="${esc(window.ksKartenName(k) ?? k.file.name)}">`
            : `<div class="ks-album__bild ks-album__bild--leer">${esc(window.ksBildLeerText() ?? "kein Bild")}</div>`}
      ${leer(k.sprache) ? "" : `<span class="ks-album__chip ks-album__chip--oben-links">${esc(KUERZEL[String(k.sprache)] ?? k.sprache)}</span>`}
      ${anzahl > 1 ? `<span class="ks-album__chip ks-album__chip--oben-rechts">×${anzahl}</span>` : ""}
      ${verkauft ? `<span class="ks-album__chip ks-album__chip--unten-links ks-album__chip--verkauft">verkauft</span>` : ""}
      <!-- Der Grading-Chip unten rechts ("PSA 10", "1 von 2 gegradet") ist am 19.09.2026
           auf Marks Wort entfallen: "gegradete karten kommen sowieso mit ihren eigenen
           bildern rein" - wer eine Karte einschweissen laesst, legt ein Foto des Slabs ab,
           und darauf steht die Note schon. window.ksGradText bleibt in rahmen.js und wird
           von der Karten-Ansicht weiter genutzt; der Filter "nur gegradet" bleibt. -->
    </div>
    <div class="ks-album__name">${esc(window.ksKartenName(k) ?? k.file.name)}</div>
    ${leer(window.ksOriginalName(k)) ? "" : `<div class="ks-album__orig">${esc(window.ksOriginalName(k))}</div>`}
    <div class="ks-album__meta"><span class="ks-album__set">${esc(window.ksSetName(k))}</span><span class="ks-album__nummer">${esc(k.nummer)}</span></div>
    <div class="ks-album__wert">${window.ksGeld(wert, wert != null, { leer: nurVerkauft ? "alle verkauft" : "kein Preis", ab: ohnePreis > 0 })}${anzahl > 1 && wert != null ? `<span style="color:var(--still);font-weight:600;font-size:12px"> gesamt</span>` : ""}</div>
  </a>`).join("");

const html = `<div class="ks-seite">
  ${window.ksNaviHtml("Album.md")}
  <div class="ks-seite__inhalt">
    <div class="ks-kopf">
      <div><div class="ks-kopf__label">Bindertresor · Album</div>
        <!-- Auch hier zwei Gruende, ein Satz war zu wenig (Durchgang 17, Befund 3):
             ohne Bestand ist nicht "noch kein Preis", sondern "alles verkauft". -->
        <div class="ks-kopf__titel">${window.ksGeld(gesamt, mitWert, { roh: true, ab: summeUnvollstaendig, leer: alleVerkauft ? "alles verkauft" : "noch kein Preis" })}</div></div>
      <div class="ks-kopf__rechts"><!-- EINE Zahl, und sie zaehlt Karten - jedes Exemplar eines (Marks Wort
           19.09.2026: "alle karten insgesamt einfach nur"). Bis dahin stand hier
           "63 verschiedene · 75 Karten": links die Notizen, rechts die Exemplare. Die
           Unterscheidung bleibt dort, wo sie etwas erklaert - im Set-Fortschritt, denn wer
           dieselbe Karte dreimal hat, ist im Set nicht weiter. -->
      <span class="ks-kopf__label">${stueck} ${stueck === 1 ? "Karte" : "Karten"}</span>${window.ksNeuKnopfHtml()}</div>
    </div>
    <!-- Karte anlegen ohne Claude (18.09.2026): Formular und Suche kommen aus rahmen.js
         (window.ksNeuHtml), damit Album, Inbox und Karten-Ansicht dieselbe Stelle nutzen. -->
    ${window.ksNeuHtml({ modus: "anlegen" })}
    <div class="ks-filter">
      <input class="ks-filter__suche" type="search" placeholder="Karte, Set oder Nummer suchen" data-filter="text" autocomplete="off">
      <!-- Alle Sprachen der Tabelle stehen im Filter, die ohne Karte im Bestand ausgegraut
           (Marks Wort 18.09.2026: "grau die anderen sprachen einfach aus"). Vorher standen
           nur die vorhandenen drin - wer dachte, das Produkt kenne nur Deutsch, sah im
           Filter nichts anderes. Sprachen, die eine Karte traegt, aber nicht in der Tabelle
           stehen, kommen hinten dazu, damit keine Karte unfilterbar wird. -->
      <select class="ks-filter__wahl" data-filter="sprache">
        <option value="">Alle Sprachen</option>
        ${[...window.ksSprachen, ...sprachen.filter(x => !window.ksSprachen.includes(x))]
          .map(x => `<option value="${esc(x)}"${sprachen.includes(x) ? "" : " disabled"}>${esc(x)}</option>`).join("")}
      </select>
      <select class="ks-filter__wahl" data-filter="grading">
        <option value="">Gegradet und raw</option>
        <option value="ja">nur gegradet</option>
        <option value="nein">nur raw</option>
      </select>
      <select class="ks-filter__wahl" data-filter="verkauft">
        <option value="nein">Bestand</option>
        <option value="">Bestand und verkauft</option>
        <option value="ja">nur verkauft</option>
      </select>
      <select class="ks-filter__wahl" data-filter="sortierung">
        <option value="wert">Wert, absteigend</option>
        <option value="wert-auf">Wert, aufsteigend</option>
        <option value="name">Name A–Z</option>
        <option value="set">Set A–Z</option>
      </select>
      <span class="ks-filter__zahl"></span>
    </div>
    <div class="ks-album">${kacheln}</div>
  </div>
</div>`;

window.ksRahmen(dv, {
  html,
  hoehe: "calc(100vh - 144px)",
  fertig: (dok) => {
    // Gefiltert wird im DOM, nicht neu gerendert: bei vielen Karten ist das der
    // Unterschied zwischen sofort und spuerbar.
    const leiste = dok.querySelector(".ks-filter");
    const album = dok.querySelector(".ks-album");
    const zahl = dok.querySelector(".ks-filter__zahl");
    if (!leiste || !album) return;
    const alle = [...album.children];
    // Alle Karten im Album, Dopplungen mitgezaehlt - die Bezugsgroesse beider Zaehler.
    const stueckAlle = alle.reduce((s, el) => s + (Number(el.dataset.stueck) || 0), 0);

    const anwenden = () => {
      const wert = (n) => (leiste.querySelector(`[data-filter="${n}"]`) || {}).value || "";
      // wortweise suchen: jedes Wort muss vorkommen, Reihenfolge und Satzzeichen egal
      const worte = wert("text").toLowerCase()
        .replace(/[-–—_/.,:;()[\]]/g, " ").split(/\s+/).filter(Boolean);
      const sprache = wert("sprache"), grading = wert("grading"), verkauft = wert("verkauft");
      let sichtbar = 0, sichtbareStueck = 0;
      for (const el of alle) {
        const d = el.dataset;
        const passt =
          (!worte.length || worte.every(x => d.such.includes(x))) &&
          (!sprache || d.sprache === sprache) &&
          // "nur gegradet" fragt nach einem gegradeten Exemplar, "nur raw" nach einem
          // rohen - genau wie "Bestand" und "nur verkauft" darunter. Eine Notiz mit
          // einem Slab UND einer rohen Karte erscheint in beiden Listen, sie ist beides.
          // Bis 16.09.2026 galt sie nur als gegradet und fehlte unter "nur raw".
          (!grading || (grading === "ja" ? d.grading === "ja" : d.roh === "ja")) &&
          // "Bestand" fragt nach einem vorhandenen Exemplar, "nur verkauft" nach einem
          // verkauften. Eine Notiz mit beidem erscheint in beiden Listen - sie ist beides.
          (verkauft === "" || (verkauft === "ja" ? d.verkauft === "ja" : d.bestand === "ja"));
        el.hidden = !passt;
        if (passt) { sichtbar++; sichtbareStueck += Number(el.dataset.stueck) || 0; }
      }
      // Nur noch EINE Zahl, und die zaehlt Karten - jedes Exemplar eines (Marks Wort
      // 19.09.2026: "mach hier einfach nur Karten. alle karten die im album sind, keine
      // unterscheidungen zu dopplungen"). Bis dahin stand hier "63 von 64 verschiedenen",
      // also die Zahl der Kacheln; jetzt zaehlt der Filter dieselbe Menge wie der Kopf und
      // wie die Dashboard-Kachel "Karten".
      zahl.textContent = sichtbar === alle.length
        ? `${stueckAlle} ${stueckAlle === 1 ? "Karte" : "Karten"}`
        : `${sichtbareStueck} von ${stueckAlle} Karten`;

      const wie = wert("sortierung");
      const schluessel = {
        "wert": (a, b) => Number(b.dataset.wert) - Number(a.dataset.wert),
        "wert-auf": (a, b) => Number(a.dataset.wert) - Number(b.dataset.wert),
        "name": (a, b) => a.dataset.name.localeCompare(b.dataset.name, "de"),
        // Karten ohne Set ans Ende, nicht an den Anfang
        "set": (a, b) => (a.dataset.set ? 0 : 1) - (b.dataset.set ? 0 : 1)
          || a.dataset.set.localeCompare(b.dataset.set, "de")
          || a.dataset.name.localeCompare(b.dataset.name, "de"),
      }[wie];
      if (schluessel) {
        // ganz verkaufte bleiben in jeder Sortierung hinten - also die ohne Bestand.
        // Nicht über data-verkauft: das trägt jetzt auch, wer noch ein Exemplar hat.
        const neu = [...alle].sort((a, b) => (a.dataset.bestand ? 0 : 1) - (b.dataset.bestand ? 0 : 1) || schluessel(a, b));
        // NUR anfassen, wenn sich die Reihenfolge wirklich aendert (19.09.2026, von Mark
        // gemeldet: "wenn ich suche, muss ich zwei mal auf die karte klicken"). appendChild
        // haengt jede Kachel neu ein - auch an dieselbe Stelle. Passiert das waehrend eines
        // Klicks, ist das Element beim Loslassen ein anderes als beim Druecken, und der
        // Browser feuert gar kein click-Ereignis: Der erste Klick verpufft.
        if (neu.some((el, n) => album.children[n] !== el)) neu.forEach(el => album.appendChild(el));
      }
    };

    leiste.addEventListener("input", anwenden);
    // `change` nur fuer die Auswahlfelder. Am Suchfeld feuert es beim VERLASSEN - also
    // genau beim ersten Klick auf eine Kachel; was es dort auesloesen wuerde, hat `input`
    // beim Tippen laengst erledigt.
    leiste.addEventListener("change", (e) => { if (!e.target.matches('[data-filter="text"]')) anwenden(); });
    anwenden();
  },
});
