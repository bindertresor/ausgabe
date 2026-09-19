// Set-Übersicht im Rahmen (15.09.2026). Aufruf aus Sets.md: await dv.view("Skripte/seite-sets");
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

// Set-Größe und Füllstand kommen aus rahmen.js (window.ksSetGroesse, window.ksSetAnteil) -
// dieselbe Rechnung stand bis 16.09.2026 gleichlautend auch in seite-erfolge.js, und
// "Halbes Set" dort hängt an genau diesem Ergebnis (Fehlermuster 11).
// Karten über der Größe (Secret Rares wie 232/91) gibt es wirklich - deshalb kann
// "besitzt" größer sein als die Nummer hergibt.
const sets = new Map();
for (const k of dv.pages('"Karten"')) {
  if (leer(k.set)) continue;
  // Wert-Regel nur an einer Stelle: window.ksWert in rahmen.js (Fehlermuster 11)
  const w = window.ksWert(k, leer(k.preis) ? null : zahl(k.preis));
  if (!w.stueck) continue;               // ganz verkaufte Karten zählen nicht mehr
  const name = String(window.ksSetName(k));
  if (!sets.has(name)) sets.set(name, { name, karten: [], groesse: null, wert: 0, stueck: 0, mitWert: 0, ohnePreis: 0 });
  const e = sets.get(name);
  e.karten.push(k);
  // `stueck` (Exemplare je Set) hat seit dem 19.09.2026 keinen Verbraucher mehr - der Fuss
  // nennt nur noch die Notizen. Die Zaehlung bleibt stehen, sie kostet nichts und wird
  // gebraucht, sobald ein Set wieder seine Exemplarzahl zeigen soll.
  e.stueck += w.stueck;
  const g = window.ksSetGroesse(k.nummer);
  if (g) e.groesse = Math.max(e.groesse ?? 0, g);
  // Mitzaehlen, wie viele Karten überhaupt einen Wert haben: ein Set, in dem keine einzige
  // einen Preis trägt, sagt "noch kein Preis" wie im Album - statt harte 0,00 € zu behaupten.
  if (w.hatWert) e.mitWert++;
  // Exemplare ohne bekannten Preis zaehlen nicht als 0 € mit: Die Set-Summe ist dann eine
  // UNTERGRENZE und bekommt "ab" davor (gemeldet 16.09.2026, window.ksWert.ohnePreis).
  e.ohnePreis += w.ohnePreis;
  e.wert += w.gesamt;
}

const liste = [...sets.values()].sort((a, b) => b.wert - a.wert || b.karten.length - a.karten.length);
const gesamtWert = liste.reduce((s, x) => s + x.wert, 0);
// Sets, deren Groesse aus der Kartennummer hervorgeht. Seit dem 19.09.2026 ohne Verbraucher -
// der Kopf nannte bis dahin "8 mit bekannter Größe". Die Zeile bleibt stehen, wer eine
// Auswertung ueber vollstaendig vermessene Sets baut, braucht sie wieder.
const mitGroesse = liste.filter(x => x.groesse);
const mitWert = liste.reduce((s, x) => s + x.mitWert, 0);
const ohnePreisGesamt = liste.reduce((s, x) => s + x.ohnePreis, 0);

const zeile = (s) => {
  const roh = window.ksSetAnteil(s.karten.length, s.groesse);
  const anteil = roh == null ? null : roh * 100;
  return `<div class="ks-sets__eintrag">
    <div class="ks-sets__kopf">
      <span class="ks-sets__name">${esc(s.name)}</span>
      <span class="ks-sets__wert">${window.ksGeld(s.wert, s.mitWert, { leer: "kein Preis", ab: s.ohnePreis > 0 })}</span>
    </div>
    <div class="ks-sets__bahn">${anteil == null ? "" : `<span class="ks-sets__fuellung" style="width:${anteil.toFixed(1)}%"></span>`}</div>
    <!-- EINE Angabe, und sie beantwortet die einzige Frage, die man an ein Set hat: wie
         viele seiner Karten habe ich (Marks Wort 19.09.2026: "hier steht noch zu viel
         unbrauchbares in den hinweistexten. einfach nur wie viel karten man vom set schon
         hat"). Dopplungen zaehlen hier NICHT - wer dieselbe Karte dreimal besitzt, ist im
         Set nicht weiter; deshalb s.karten.length (Notizen) und nicht s.stueck.
         Weggefallen ist die linke Haelfte "8 verschiedene · 9 Karten" samt dem Wort
         "verschiedenen" rechts: Solange nur EINE Zahl dasteht, gibt es nichts mehr zu
         unterscheiden. -->
    <div class="ks-sets__fuss">
      <span>${s.groesse ? `${s.karten.length} von ${s.groesse} · ${anteil.toFixed(0)} % fertiggestellt`
        : `${s.karten.length} ${s.karten.length === 1 ? "Karte" : "Karten"} · wie groß das Set ist, ist nicht bekannt`}</span>
    </div>
  </div>`;
};

const html = `<div class="ks-seite">
  ${window.ksNaviHtml("Sets.md")}
  <div class="ks-seite__inhalt">
    <div class="ks-kopf">
      <div><div class="ks-kopf__label">Bindertresor · Sets</div>
        <div class="ks-kopf__titel">${liste.length} ${liste.length === 1 ? "Set" : "Sets"}</div></div>
      <!-- Nur der Gesamtwert. "· 8 mit bekannter Größe" ist am 19.09.2026 auf Marks Wort
           entfallen ("was ist das fuern muell hier"): Die Zahl erklaerte eine Eigenheit der
           Technik - dass die Set-Groesse aus der Kartennummer kommt und manchmal fehlt -,
           nicht die Sammlung. Wo sie fehlt, sagt es der Fuss des Sets selbst. -->
      <div class="ks-kopf__label">${window.ksGeld(gesamtWert, mitWert, { roh: true, ab: ohnePreisGesamt > 0 })}</div>
    </div>
    <div class="ks-flaeche">
      <!-- "Die Set-Größe kommt aus der Kartennummer" ist am 19.09.2026 auf Marks Wort
           entfallen ("und was soll das hier"): Woher eine Zahl stammt, ist Bauwissen und
           steht in CLAUDE.md, nicht ueber der Liste. -->
      <div class="ks-flaeche__kopf"><span class="ks-flaeche__titel">Nach Wert</span></div>
      ${liste.length ? `<div class="ks-sets">${liste.map(zeile).join("")}</div>`
                     : `<div class="ks-karte__leer">Noch keine Karten mit Set.</div>`}
    </div>
  </div>
</div>`;

window.ksRahmen(dv, {
  html, hoehe: "calc(100vh - 144px)",
  // Plasma-Balken (18.09.2026) laufen nur im Bild - dieselbe Regel wie auf der Erfolge-Seite.
  fertig: (dok) => {
    const eintraege = [...dok.querySelectorAll(".ks-sets__eintrag")].filter((e) => e.querySelector(".ks-sets__fuellung"));
    if (!eintraege.length || !dok.defaultView.IntersectionObserver) { for (const e of eintraege) e.classList.add("ks-sets__eintrag--im-bild"); return; }
    const io = new dok.defaultView.IntersectionObserver((liste) => {
      for (const e of liste) e.target.classList.toggle("ks-sets__eintrag--im-bild", e.isIntersecting);
    }, { threshold: 0 });
    for (const e of eintraege) io.observe(e);
  },
});
