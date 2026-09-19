// Erfolge im Rahmen (16.09.2026). Aufruf aus Erfolge.md: await dv.view("Skripte/seite-erfolge");
// Die Ziele rechnen sich allein aus der Sammlung aus - es wird nichts gespeichert und
// nichts abgehakt. Wer eine Karte anlegt, sieht den Fortschritt beim naechsten Aufruf.
await dv.view("Skripte/rahmen");

const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const leer = (v) => v == null || v === "" || (Array.isArray(v) && !v.length);
// Zahl aus dem Kopfblock: DIE EINE Lesart aus rahmen.js (window.ksZahl) - leer und
// UNLESBAR sind `null`, nie 0. Bis 18.09.2026 stand hier `: 0`, und ein Kopfblock mit
// `preis: "12.50"` (in Anfuehrungszeichen) zeigte "0,00 €", waehrend preise.py 12,50 €
// in Wertverlauf.csv schrieb (Durchgang 17, Befund 2). Die Konstante bleibt stehen,
// damit die Aufrufe unveraendert lesen - sie zeigt nur nicht mehr auf eine eigene Regel.
const zahl = (v) => window.ksZahl(v);
const euro = (n) => Math.round(n).toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
// Wie der Stand eines Ziels gelesen wird. Die Einheit gehoert dazu: "9 von 50" sah in
// derselben Spalte aus wie "62 von 100" (Karten) und "8 von 20" (Sets), meinte aber
// Prozent - eine von vier Zeilen zaehlte etwas anderes, als sie aussah (gemeldet
// 16.09.2026). Die Form bekommt beide Zahlen, damit die Einheit dort steht, wo sie
// im Deutschen hingehoert: "9 % von 50 %", aber "366 von 365 Tagen".
const stk = (i, z) => `${i} von ${z}`;
// Marks Wortregelung 18.09.2026: "Karte" allein heisst ueberall EXEMPLAR. Wo eine Zahl
// NOTIZEN zaehlt, muss die Beschriftung den Unterschied nennen - sonst stehen zwei
// Bedeutungen desselben Wortes in derselben Spalte ("62 von 64" neben "77 von 100").
// Andere Form als window.ksVerschieden, mit Absicht: Hier steht ein Stand "i von z", dort
// eine blanke Menge. Geprueft am 19.09.2026 (Durchgang 21, Befund N6): Diese Form hat
// KEINEN Einzahlfall, der das Wort "Karte" auf eine Notizenzahl setzt - "1 von 25
// verschiedenen" stimmt. Sie bleibt darum, wie sie ist. Wer sie aendert, sieht in
// rahmen.js nach, ob dieselbe Wortregel dort schon steht.
const versch = (i, z) => `${i} von ${z} verschiedenen`;
// Geld laeuft wie ueberall durch window.ksGeld (rahmen.js) - und damit auch die Regel
// "kein Betrag ohne bekannten Preis". Diese Seite hielt sich als einzige der sechs nicht
// daran: Ein Vault ohne Preislauf zeigte "Schatzstueck · eine einzelne Karte ueber 100 €
// · 0 € von 100 €", also die Behauptung, die teuerste Karte sei 0 € wert, waehrend vier
// andere Seiten an derselben Stelle "noch kein Preis" sagten (gemeldet 16.09.2026, dritte
// Wiederkehr derselben Regel). Kennt die Sammlung keinen einzigen Preis, steht hier
// derselbe Satz wie dort - die Form "X von Y" bleibt fuer jedes andere Ziel stehen.
// Kein eigener Kurzname fuer die Formatierung: Genau so faengt die Doppelpflege wieder an.
const geldForm = (ab) => (i, z) => wertBekannt
  ? `${window.ksGeld(i, true, { kurz: true, roh: true, ab: ab() })} von ${window.ksGeld(z, true, { kurz: true, roh: true })}`
  : window.ksGeld(null, false, { roh: true });
// Zwei Geldformen, weil zwei verschiedene Zahlen dahinterstehen (Durchgang 17, Befund 1):
// `geldSumme` ist eine Summe ueber die ganze Sammlung und damit eine UNTERGRENZE, sobald
// irgendwo ein Exemplar ohne bekannten Preis steht - sie bekommt "ab" davor, genau wie
// Album, Sets, Dashboard und Karten-Ansicht es seit dem 16.09.2026 tun. Diese Seite war
// die einzige von sechs ohne "ab"; ein Ziel konnte dadurch als "nicht geschafft"
// dastehen, was die Seite gar nicht wissen kann. `geld` ohne "ab" bleibt fuer
// "Schatzstueck" und "Trophaee": Dort steht ein ECHTER Einzelwert (w.einzel), keine Summe -
// wer die mit umstellt, behauptet eine Unsicherheit, die es dort nicht gibt.
const geldSumme = geldForm(() => summeUnvollstaendig);
const geld = geldForm(() => false);
const proz = (i, z) => `${i} % von ${z} %`;
// nicht `tage`: so heisst weiter unten die gemessene Laufzeit der Kurve. Eine zweite
// `const` desselben Namens toetet den ganzen dataviewjs-Block, lautlos (Fehlermuster 5).
const dauer = (i, z) => `${i} von ${z} Tagen`;

const karten = dv.pages('"Karten"').array();

let stueck = 0, wertGesamt = 0, teuerste = 0, gegradet = 0, verkauft = 0;
// `exImBestand` hat seit dem 19.09.2026 keinen Verbraucher mehr - es war die Bezugsgroesse
// des Ziels "Einkaufsbuch gefuehrt", das seither auf einer festen Zehn steht. Die Zaehlung
// bleibt stehen; wer hier ein Ziel ueber alle Exemplare baut, braucht sie wieder.
let ohnePreis = 0, mitBild = 0, mitKaufpreis = 0, exImBestand = 0, doppel = 0;
// Kennt die Sammlung ueberhaupt einen Preis? Ohne das stuende bei den fuenf Geldzielen
// "0 € von 100 €" - eine Zahl, die die Seite nicht wissen kann (siehe `geld` oben).
let wertBekannt = false;
// Steht IRGENDWO ein Exemplar im Bestand ohne bekannten Preis, ist jede Summe ueber die
// Sammlung eine Untergrenze - dann "ab 900 € von 1.000 €" (Durchgang 17, Befund 1).
// Nicht dasselbe wie `ohnePreis`: das zaehlt NOTIZEN, das hier ist eine Ja-Nein-Frage.
let summeUnvollstaendig = false;
// Wie viele Notizen ueberhaupt noch ein Exemplar im Bestand haben. Die Ziele der Gruppe
// "Ordnung halten" sagen "im Bestand" und muessen auch darueber rechnen: Wer seine
// Sammlung aufgeloest hat, bekam bis 16.09.2026 "Alles bepreist · geschafft" gemeldet,
// obwohl nichts mehr da war.
let imBestandKarten = 0;
const sprachen = new Set();
const sets = new Map();

for (const k of karten) {
  const preis = leer(k.preis) ? null : zahl(k.preis);
  // Wert-Regel und Mengen nur an einer Stelle: window.ksWert in rahmen.js (Fehlermuster 11).
  // `imBestand` und `einzel` kommen von dort - beides hier noch einmal aus `exemplare`
  // zusammenzusuchen war die dritte Wiederkehr desselben Musters (gemeldet 16.09.2026).
  const w = window.ksWert(k, preis);
  stueck += w.stueck;
  wertGesamt += w.gesamt;
  verkauft += w.verkauft;
  exImBestand += w.stueck;
  if (w.stueck >= 2) doppel++;
  if (w.stueck && w.hatWert) wertBekannt = true;
  // Eine Karte gilt erst als bepreist, wenn JEDES Exemplar im Bestand einen Wert hat.
  // Bis 16.09.2026 genuegte `hatWert`: Eine gegradete Karte mit eigenem Wert neben einem
  // rohen Exemplar ohne Marktpreis meldete "Alles bepreist · geschafft", obwohl das
  // zweite Exemplar in jeder Summe als 0 € gefuehrt wurde (window.ksWert.ohnePreis).
  if (w.stueck && (w.ohnePreis || !w.hatWert)) ohnePreis++;
  if (w.stueck && w.ohnePreis) summeUnvollstaendig = true;
  for (const e of w.imBestand) {
    if (e.grading) gegradet++;
    if (e.kaufpreis != null) mitKaufpreis++;
  }
  for (const v of w.einzel) if (v > teuerste) teuerste = v;
  // Ganz verkaufte Notizen zaehlen nicht mehr zur Sammlung - genauso wie auf der
  // Sets-Seite (`if (!w.stueck) continue`), im Album und im Dashboard. AB HIER gilt das
  // fuer JEDE Zahl dieser Seite, nicht nur fuer einen Teil: Bis 16.09.2026 standen sechs
  // Ziele ueber allen Notizen neben neunzehn ueber dem Bestand, in derselben Spalte und
  // ohne Unterschied in der Beschriftung. Wer zwei von drei Karten verkauft hatte, bekam
  // "Drei Sprachen · geschafft" fuer Sprachen, die er nicht mehr besass, und zwei Zeilen
  // weiter "Fuenf Sets 1 von 5". Eine halbe Umstellung ist schlechter als keine.
  if (!w.stueck) continue;
  imBestandKarten++;
  if (!leer(k.sprache)) sprachen.add(String(k.sprache).trim().toLowerCase());
  if (!leer(k.bild)) mitBild++;
  if (leer(k.set)) continue;
  const name = String(window.ksSetName(k));
  if (!sets.has(name)) sets.set(name, { karten: 0, groesse: null });
  const s = sets.get(name);
  s.karten++;
  const g = window.ksSetGroesse(k.nummer);
  if (g) s.groesse = Math.max(s.groesse ?? 0, g);
}

const setListe = [...sets.values()];
// Fuellstand eines Sets: dieselbe Rechnung wie auf der Sets-Seite, aus rahmen.js.
const anteilSet = (s) => window.ksSetAnteil(s.karten, s.groesse) ?? 0;
const setsVoll = setListe.filter((s) => anteilSet(s) >= 1).length;
const bestesSet = setListe.reduce((m, s) => Math.max(m, anteilSet(s)), 0);

// Wie lange die Kurve schon laeuft: aus window.ksVerlauf (rahmen.js), derselben Quelle,
// aus der das Dashboard seinen Graphen baut. Beide Seiten zerlegten die Datei bis
// 16.09.2026 selbst und meinten mit "Tage" Verschiedenes - hier die Spanne, dort die Zahl
// der Zeilen; bei einer lueckenhaften Kurve liefen sie auseinander (Fehlermuster 11).
const { tage } = await window.ksVerlauf(dv);

const Z = (name, text, ist, ziel, form = stk) => ({ name, text, ist, ziel, form });

const gruppen = [
  // Alle Ziele rechnen ueber den Bestand, nicht ueber die Zahl der Notizen
  // (`karten.length`) - eine verkaufte Karte ist keine Karte mehr in der Sammlung.
  // "Karte" heisst EXEMPLAR (Entscheidung 18.09.2026): Die vier Zaehl-Ziele nehmen
  // `stueck`, dieselbe Zahl wie die Dashboard-Kachel "Karten". Bis dahin zaehlten sie
  // Notizen (`imBestandKarten`): Wer fuenf Exemplare ergaenzte, sah "Fuenfhundert Karten"
  // stehen bleiben, waehrend die Kachel daneben hochzaehlte (gemeldet 18.09.2026 -
  // die bis dahin offene Wortfrage "Karte gegen Exemplar", Fuer-Mark Punkt 21).
  // Ziele ueber Bilder und Preise bleiben bei der Notiz: Ein Bild haengt an der Notiz,
  // und "Alles bepreist" prueft ohnehin jedes Exemplar (`ohnePreis`).
  // SEIT 18.09.2026 SPAET tragen genau diese beiden dafuer die Form `versch`
  // ("62 von 64 verschiedenen"). Bis dahin war die Umstellung halb: Die vier Zaehl-Ziele
  // rechneten ueber Exemplare, die Ordnungs-Ziele ueber Notizen, und beide standen mit
  // derselben blanken Form "X von Y" untereinander (Fehlermuster 17).
  ["Sammlung aufbauen", [
    Z("Der Anfang", "Deine erste Karte liegt in der Sammlung.", stueck, 1),
    Z("Zehn Karten", "Aus einer Handvoll wird eine Sammlung.", stueck, 10),
    Z("Hundert Karten", "Jetzt lohnt sich die Ordnung wirklich.", stueck, 100),
    Z("Fünfhundert Karten", "Ein Bestand, den du ohne Liste nicht mehr überblickst.", stueck, 500),
    Z("Doppelt vorhanden", "Du besitzt dieselbe Karte mehrfach — Tauschmaterial.", doppel, 1),
    Z("Drei Sprachen", "Karten aus verschiedenen Ländern in einer Sammlung.", sprachen.size, 3),
    Z("Fünf Sprachen", "Deutsch, Englisch, Japanisch und mehr.", sprachen.size, 5),
  ]],
  ["Was die Sammlung wert ist", [
    Z("Erste hundert Euro", "Der Gesamtwert deiner Sammlung knackt 100 €.", wertGesamt, 100, geldSumme),
    Z("Vierstellig", "Deine Sammlung ist über 1.000 € wert.", wertGesamt, 1000, geldSumme),
    Z("Fünfstellig", "Über 10.000 € — das ist kein Schuhkarton mehr.", wertGesamt, 10000, geldSumme),
    Z("Schatzstück", "Eine einzelne Karte über 100 € im Bestand.", teuerste, 100, geld),
    Z("Trophäe", "Eine einzelne Karte über 500 € im Bestand.", teuerste, 500, geld),
    Z("Ein Monat Verlauf", "Seit 30 Tagen wird der Wert deiner Sammlung mitgeschrieben.", tage, 30, dauer),
    Z("Ein Jahr Verlauf", "Ein volles Jahr Wertentwicklung zum Nachschlagen.", tage, 365, dauer),
  ]],
  ["Sets vervollständigen", [
    Z("Fünf Sets", "Karten aus fünf verschiedenen Sets.", sets.size, 5),
    Z("Zwanzig Sets", "Deine Sammlung reicht über viele Erscheinungen.", sets.size, 20),
    Z("Halbes Set", "Ein Set ist zur Hälfte zusammen.", Math.round(bestesSet * 100), 50, proz),
    Z("Set komplett", "Ein Set ist vollständig — jede Karte da.", setsVoll, 1),
    Z("Drei Sets komplett", "Drei vollständige Sets im Regal.", setsVoll, 3),
  ]],
  ["Ordnung halten", [
    // Diese beiden zaehlen NOTIZEN, nicht Exemplare - und nach Marks Wortregelung
    // (18.09.2026, "Karte = Exemplar") muss die Beschriftung das sagen, sonst stuende
    // "62 von 64" in derselben Spalte wie "77 von 100" und meinte etwas anderes.
    // Die Zahl bleibt richtig: ein Bild haengt an der Notiz, nicht am Exemplar.
    Z("Alles bepreist", "Jede Karte im Bestand hat einen Wert.", imBestandKarten - ohnePreis, Math.max(1, imBestandKarten), versch),
    Z("Alles bebildert", "Zu jeder verschiedenen Karte im Bestand gehört ein Bild.", mitBild, Math.max(1, imBestandKarten), versch),
    // Zehn statt "zu jeder" (Marks Entscheidung 19.09.2026: "das ding kann niemals erfuellt
    // werden"). Preis und Bild kommen beim Anlegen von selbst mit, ein Kaufpreis nicht - wer
    // Booster oeffnet, tauscht oder geschenkt bekommt, hat fuer diese Karten gar keinen.
    // Das Ziel stand bei 8 von 73 und waere dort geblieben.
    Z("Einkaufsbuch geführt", "Bei zehn Karten steht der Kaufpreis.", mitKaufpreis, 10),
    Z("Erster Slab", "Eine gegradete Karte im Bestand.", gegradet, 1),
    Z("Sammlerqualität", "Zehn gegradete Karten im Bestand.", gegradet, 10),
    Z("Erster Verkauf", "Du hast eine Karte aus der Sammlung verkauft.", verkauft, 1),
  ]],
];

const alle = gruppen.flatMap(([, z]) => z);
const geschafft = alle.filter((z) => z.ist >= z.ziel).length;
const anteilGesamt = alle.length ? geschafft / alle.length * 100 : 0;

const haken = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5l9 -9"/></svg>`;

const eintrag = (z) => {
  const fertig = z.ist >= z.ziel;
  const anteil = z.ziel ? Math.min(100, z.ist / z.ziel * 100) : 0;
  return `<div class="ks-erfolg${fertig ? " ks-erfolg--fertig" : ""}">
    <span class="ks-erfolg__marke">${fertig ? haken : ""}</span>
    <div class="ks-erfolg__text">
      <div class="ks-erfolg__name">${esc(z.name)}</div>
      <div class="ks-erfolg__satz">${esc(z.text)}</div>
    </div>
    <!-- "geschafft" bekommt vier Funken (Marks Wort 18.09.2026: "sterne glowy und ziehen streife
         hinter sich her") - jeder mit eigenem Startpunkt, Richtung und Zuendzeit aus CSS-Variablen,
         damit vier Funken nach vier Seiten fliegen statt im Gleichschritt. -->
    <span class="ks-erfolg__stand${fertig ? " ks-erfolg__stand--fertig" : ""}">${fertig ? "geschafft" : esc(z.form(z.ist, z.ziel))}</span>
    <!-- Die Bahn steht NACH dem Stand als eigene, volle Zeile (Marks Wort 18.09.2026:
         "immer noch kein full width") - in der Textspalte endete sie vor der Zahl rechts. -->
    ${fertig ? "" : `<div class="ks-sets__bahn ks-erfolg__bahn"><span class="ks-sets__fuellung" style="width:${anteil.toFixed(1)}%"></span></div>`}
  </div>`;
};

const flaeche = ([titel, ziele]) => {
  const fertig = ziele.filter((z) => z.ist >= z.ziel).length;
  return `<div class="ks-flaeche">
    <div class="ks-flaeche__kopf"><span class="ks-flaeche__titel">${esc(titel)}</span>
      <span class="ks-kopf__label">${fertig} von ${ziele.length}</span></div>
    <div class="ks-erfolge">${ziele.map(eintrag).join("")}</div>
  </div>`;
};

const html = `<div class="ks-seite">
  ${window.ksNaviHtml("Erfolge.md")}
  <div class="ks-seite__inhalt">
    <div class="ks-kopf">
      <div><div class="ks-kopf__label">Bindertresor · Erfolge</div>
        <div class="ks-kopf__titel">${geschafft} von ${alle.length} geschafft</div></div>
      <div class="ks-kopf__label">${anteilGesamt.toFixed(0)} % · die Ziele rechnen sich aus deiner Sammlung</div>
      <!-- Gesamtbalken ueber die volle Breite (Marks Wort 18.09.2026: "hier brauchen wir auch
           eine balken") - dieselbe Bahn wie bei den Zielen, nur fuer alle zusammen. -->
      <div class="ks-sets__bahn ks-kopf__bahn"><span class="ks-sets__fuellung" style="width:${anteilGesamt.toFixed(1)}%"></span></div>
    </div>
    ${gruppen.map(flaeche).join("")}
  </div>
</div>`;

window.ksRahmen(dv, {
  html, hoehe: "calc(100vh - 144px)",
  // Plasma-Balken laufen nur im Bild (Performance-Regel: keine Endlos-Animation ausserhalb
  // des Bilds). Die Klasse schaltet in oberflaeche.css den Lauf frei; ohne sie steht alles.
  fertig: (dok) => {
    // Alle Ziele beobachten - offene wegen der Balken, erreichte wegen der Funken.
    // Der Gesamtbalken im Kopf haengt mit drin - er ist kein Ziel-Eintrag, traegt die
    // Lauf-Klasse aber selbst und steht damit ausserhalb des Bilds genauso still.
    const ziele = [...dok.querySelectorAll(".ks-erfolg, .ks-kopf__bahn")].filter((z) => z.querySelector(".ks-sets__fuellung, .ks-erfolg__stand--fertig"));

    // Funken um "geschafft" (18.09.2026, Vorbild cssscript.com/demo/star-sparkle-text):
    // fortlaufend neue Sterne mit Zufallsgroesse, -richtung, -dauer, -farbe; jeder lebt
    // 1 bis 3 s und wird danach entfernt. Nur fuer Woerter im Bild (ks-erfolg--im-bild),
    // hoechstens zwanzig je Wort (Marks Wort 18.09.2026: "mehr sterne"), und der Takt endet von selbst, sobald der Rahmen ersetzt
    // wurde (rebuildView haengt einen neuen an) - sonst liefe er auf einem toten Dokument
    // weiter. Bei Bewegungswunsch "reduziert" gibt es keine Sterne.
    const w = dok.defaultView;
    if (w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const zufall = (max, min) => Math.floor(Math.random() * (max - min + 1)) + min;
    const vorzeichen = () => (Math.random() > 0.5 ? 1 : -1);
    const woerter = [...dok.querySelectorAll(".ks-erfolg__stand--fertig")];
    const takt = w.setInterval(() => {
      if (!dok.isConnected || !dok.defaultView) { clearInterval(takt); return; }
      for (const wort of woerter) {
        if (!wort.closest(".ks-erfolg")?.classList.contains("ks-erfolg--im-bild")) continue;
        if (wort.querySelectorAll(".ks-funke").length >= 20) continue;
        if (Math.random() > 0.75) continue;   // nicht bei jedem Takt jedes Wort - sonst Gleichschritt
        const groesse = zufall(14, 6), leben = zufall(3, 1);
        const stern = dok.createElement("i");
        stern.className = "ks-funke";
        stern.style.setProperty("--x", zufall(80, 20) + "%");
        stern.style.setProperty("--groesse", groesse + "px");
        stern.style.setProperty("--leben", leben + "s");
        stern.style.setProperty("--dx", zufall(70, 24) * vorzeichen() + "px");
        stern.style.setProperty("--dy", zufall(34, 12) * vorzeichen() + "px");
        stern.style.setProperty("--drehung", 180 * leben + "deg");
        // Palette statt Regenbogen: Blau bis Cyan, dazu ab und zu Weiss
        stern.style.setProperty("--farbe", Math.random() < 0.25 ? "#ffffff" : `hsl(${zufall(230, 185)} 100% ${zufall(78, 62)}%)`);
        wort.appendChild(stern);
        w.setTimeout(() => stern.remove(), leben * 1000);
      }
    }, 70);
    if (!ziele.length || !dok.defaultView.IntersectionObserver) { for (const z of ziele) z.classList.add("ks-erfolg--im-bild"); return; }
    const io = new dok.defaultView.IntersectionObserver((eintraege) => {
      for (const e of eintraege) e.target.classList.toggle("ks-erfolg--im-bild", e.isIntersecting);
    }, { threshold: 0 });
    for (const z of ziele) io.observe(z);
  },
});
