// Dashboard im Rahmen (15.09.2026). Aufruf aus Dashboard.md: await dv.view("Skripte/seite-dashboard");
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
const euroKurz = (n) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

/* ---- Zahlen aus den Karten ---------------------------------------------------------------- */
const alleKarten = dv.pages('"Karten"');
// Eine Karte kann mehrere Exemplare haben, jedes mit eigenem Zustand und Preis.
const mitEx = alleKarten.map(k => ({ k, ex: window.ksExemplare(k) })).array();
const karten = alleKarten.filter(k => window.ksExemplare(k).some(e => !e.verkauft));
const verkaufte = mitEx.filter(x => x.ex.every(e => e.verkauft));

// `aeltesterAbruf` heisst seit 19.09.2026 `letzterAbruf` - er traegt jetzt das Maximum
// statt des Minimums, und ein Name, der das Gegenteil sagt, ist die naechste Falle.
let wert = 0, kauf = 0, stueck = 0, gegradet = 0, mitPreis = 0, aeltester = null, letzterAbruf = null;

// "2026-09-18 23:53" aus dem Kopfblock, egal in welcher Gestalt es zurueckkommt: YAML liest
// diese Schreibweise als ZEITWERT, nicht als Text - also kann dort ein Luxon-DateTime
// (Dataview), ein Date (Fremdparser) oder die blanke Zeichenkette stehen. Alle drei Wege
// muessen dieselbe sortierbare Form ergeben, denn die Kachel sucht den aeltesten Abruf
// ueber einen Textvergleich. Was zu nichts davon passt, faellt raus statt Unsinn zu zeigen.
const stempel = (v) => {
  if (v?.toFormat) return v.toFormat("yyyy-MM-dd HH:mm");
  if (v instanceof Date && !isNaN(v)) {
    const z = (n) => String(n).padStart(2, "0");
    return `${v.getFullYear()}-${z(v.getMonth() + 1)}-${z(v.getDate())} ${z(v.getHours())}:${z(v.getMinutes())}`;
  }
  const t = String(v).slice(0, 16);
  return /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2})?$/.test(t) ? t.replace("T", " ") : null;
};
// Wie viele Karten im Bestand mindestens EIN Exemplar ohne bekannten Preis tragen.
// Bis 16.09.2026 stand hier `karten.length - mitPreis`: Das zaehlte ganz verkaufte Notizen
// als "ohne Preis" mit (sie stehen in `karten` gar nicht) und uebersah die Karte, bei der
// ein Exemplar einen eigenen Wert hat und das zweite gar keinen - die zaehlte als
// vollstaendig bepreist, waehrend ihre Summe das unbekannte Exemplar als 0 € fuehrte.
let ohnePreis = 0;
for (const { k, ex } of mitEx) {
  const da = ex.filter(e => !e.verkauft);
  stueck += da.length;
  // Bestandszahl, darum `da` und nicht `gezeigte`: die Kachel steht neben "Karten" und
  // "Gesamtwert", die ebenfalls nur den Bestand zählen. Verkauftes gehört in keine der drei.
  gegradet += da.filter(e => e.grading).length;
  kauf += da.reduce((sa, e) => sa + (e.kaufpreis ?? 0), 0);
  // Wert-Regel nur an einer Stelle: window.ksWert in rahmen.js (Fehlermuster 11)
  const w = window.ksWert(k, leer(k.preis) ? null : zahl(k.preis));
  if (w.stueck && w.hatWert) { wert += w.gesamt; mitPreis++; }
  if (w.stueck && w.ohnePreis) ohnePreis++;
  // `aeltester` ist der aelteste CARDMARKET-Rechenstand. Er hat auf dieser Seite seit dem
  // 18.09.2026 abends keinen Verbraucher mehr - die Kachel zeigt jetzt den eigenen Abruf.
  // Die Rechnung bleibt unberuehrt stehen (wie gruss()/nutzer()/anrede() weiter unten):
  // Das Feld selbst lebt, die Karten-Ansicht zeigt es je Karte als "Cardmarket · Stand".
  if (!leer(k.preis_stand)) {
    const d = String(k.preis_stand.toFormat ? k.preis_stand.toFormat("yyyy-MM-dd") : k.preis_stand);
    if (!aeltester || d < aeltester) aeltester = d;
  }
  // Der JUENGSTE eigene ABRUF, nicht der Cardmarket-Stand. Bis 19.09.2026 stand hier das
  // Minimum (`g < letzterAbruf`), waehrend die Kachel darueber "Preise zuletzt aktualisiert"
  // heisst - Beschriftung und Rechnung sagten Verschiedenes (Durchgang 20, Befund 1/3).
  // Den Namen hat Mark am 19.09.2026 selbst gesetzt ("mach doch einfach 'Preise zuletzt
  // aktualisiert'"), also folgt die Rechnung ihm: Gefragt ist der Zeitpunkt des letzten
  // Laufs. Wie vollstaendig er war, sagt die Schlussmeldung des Laufs, nicht diese Zahl.
  // Dataview macht aus "2026-09-18 23:53" je nach Kopfblock einen Zeitwert; deshalb hier
  // dieselbe Behandlung wie oben.
  if (!leer(k.preis_geholt)) {
    const g = stempel(k.preis_geholt);
    if (g && (!letzterAbruf || g > letzterAbruf)) letzterAbruf = g;
  }
}
// Die Summe ist eine UNTERGRENZE, sobald irgendwo ein Exemplar ohne Preis steht.
const summeUnvollstaendig = ohnePreis > 0;

// Was verkauft wurde. ACHTUNG, die Rechnung stimmt nicht und wird zurzeit nirgends
// angezeigt - die Kachel "Verkauft" ist am 16.09.2026 entfallen. Der Kommentar sagte bis
// dahin "nur wo beides eingetragen ist"; der Code tut etwas anderes: `erloes` sammelt
// JEDES verkaufte Exemplar mit Verkaufspreis, `einsatz` nur die Teilmenge, die
// zusätzlich einen Kaufpreis trägt. Die Differenz war damit kein Gewinn, sondern Erlös
// aller minus Einkauf einiger. Wer die Kachel zurückholt, holt den Fehler mit: dann muss
// `erloes` dieselbe Teilmenge zählen wie `einsatz` (`mitBeidem`).
let erloes = 0, einsatz = 0, mitBeidem = 0, verkaufteStueck = 0;
for (const { ex } of mitEx) {
  for (const e of ex.filter(x => x.verkauft)) {
    verkaufteStueck++;
    if (e.verkaufspreis != null) {
      erloes += e.verkaufspreis;
      if (e.kaufpreis != null) { einsatz += e.kaufpreis; mitBeidem++; }
    }
  }
}
// EIN Datumsformat fuer die ganze Seite: zweistellig, "14.09.2026" (Durchgang 17,
// Befund 6). Im selben Graphen standen bis 18.09.2026 drei Schreibweisen nebeneinander -
// Delta-Zeile "seit 16.8.2026", X-Marken "16.08.", Fadenkreuz "30.8.2026", Kachel
// "14.09.2026". Die ausgeschriebene Kopfzeile ("Donnerstag, 18. September") ist etwas
// anderes und bleibt. Arbeitet auf dem ISO-Text, nicht auf einem Date - damit dieselbe
// Zeichenkette dasselbe Ergebnis gibt, egal wer sie liest.
const dm = (iso) => iso ? String(iso).split("-").reverse().join(".") : "–";
// Dasselbe Format mit Uhrzeit, fuer Zeitpunkte statt Tage: "18.09.2026, 23:53". Baut auf
// dm() auf, damit es nur EIN Datumsformat auf der Seite gibt. Fehlt die Uhrzeit (ein
// Stempel aus der Zeit vor dem 18.09.2026), bleibt das Datum allein stehen.
const dmz = (stempel) => {
  if (!stempel) return "–";
  const [d, u] = String(stempel).split(" ");
  return u ? `${dm(d)}, ${u}` : dm(d);
};
// Mit dem Wort "Uhr" dahinter, wie man eine Uhrzeit auf Deutsch schreibt: "01:02 Uhr"
// (Marks Wort 19.09.2026). Uhrzeit und Wort stehen in EINER nowrap-Klammer: die Zahl-Zeile
// der Kachel bricht mit overflow-wrap:anywhere um, und "Uhr" landete sonst allein in der
// naechsten Zeile.
const dmzUhr = (stempel) => {
  if (!stempel) return "–";
  const [d, u] = String(stempel).split(" ");
  return u ? `${dm(d)}, <span class="ks-kachel__zeit">${u} <span class="ks-kachel__uhrwort">Uhr</span></span>` : dm(d);
};

/* ---- Wertverlauf --------------------------------------------------------------------------- */
// EINE Lesefunktion fuer die Kurve, gemeinsam mit der Erfolge-Seite: window.ksVerlauf
// in rahmen.js (Fehlermuster 11). Beide Seiten zerlegten die Datei bis 16.09.2026 selbst
// und bildeten daraus zwei verschiedene Groessen - hier die Zahl der ZEILEN ("367 Tage
// erfasst"), dort die SPANNE zwischen erstem und letztem Datum (366). Bei einer
// lueckenhaften Kurve liefen beide auseinander. `tage` ist jetzt ueberall die Spanne.
// `laufzeit` hat seit dem 19.09.2026 keinen Verbraucher mehr auf dieser Seite - die Zeile
// "seit 370 Tagen" ist auf Marks Wort entfallen. Die Groesse selbst lebt weiter: Die
// Erfolge-Seite misst "Ein Monat Verlauf" und "Ein Jahr Verlauf" an ihr, ueber dieselbe
// Funktion window.ksVerlauf.
const { punkte, tage: laufzeit } = await window.ksVerlauf(dv);

const ZEITRAEUME = [["7 T", 7], ["1 M", 30], ["6 M", 182], ["1 J", 365], ["Max", null]];

const graphHtml = (tage) => {
  if (!punkte.length) return `<div class="ks-karte__leer">Noch kein Eintrag. Das Preis-Skript schreibt bei jedem Lauf den Gesamtwert des Tages.</div>`;
  const tag = (iso) => new Date(iso + "T12:00:00");
  const heute = punkte[punkte.length - 1];
  let sicht = punkte;
  if (tage) { const ab = tag(heute.d); ab.setDate(ab.getDate() - tage); sicht = punkte.filter(p => tag(p.d) >= ab); }
  if (sicht.length < 1) sicht = punkte.slice(-1);
  const erster = sicht[0], diff = heute.w - erster.w, proz = erster.w ? diff / erster.w * 100 : 0, pos = diff >= 0;
  const farbe = sicht.length < 2 ? "#5b9cff" : (pos ? "#51cf66" : "#ff6b6b");
  const W = 800, H = 220, L = 56, R = 8, T = 14, B = 26;
  const min = Math.min(...sicht.map(p => p.w)), max = Math.max(...sicht.map(p => p.w));
  const spanne = (max - min) || Math.max(max * 0.1, 1);
  const yMin = min - spanne * 0.15, yMax = max + spanne * 0.15;
  const ms = (i) => tag(sicht[i].d).getTime();
  const tVon = ms(0), tSpanne = (ms(sicht.length - 1) - tVon) || 1;
  const x = (i) => sicht.length < 2 ? W / 2 : L + (ms(i) - tVon) / tSpanne * (W - L - R);
  const y = (w) => T + (yMax - w) / (yMax - yMin) * (H - T - B);
  const xProz = (i) => x(i) / W * 100;
  const pfad = sicht.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.w).toFixed(1)}`).join(" ");
  const flaeche = sicht.length > 1 ? `${pfad} L${x(sicht.length - 1).toFixed(1)},${(H - B).toFixed(1)} L${x(0).toFixed(1)},${(H - B).toFixed(1)} Z` : "";
  const punkt = (px, py, dick) => `<path d="M${px.toFixed(1)},${py.toFixed(1)} L${px.toFixed(1)},${py.toFixed(1)}" stroke="${farbe}" stroke-width="${dick}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
  const punkteSvg = sicht.length <= 40
    ? sicht.map((p, i) => punkt(x(i), y(p.w), i === sicht.length - 1 ? 9 : 5)).join("")
    : punkt(x(sicht.length - 1), y(heute.w), 9);
  const datumKurz = (iso, jahr) => tag(iso).toLocaleDateString("de-DE", jahr ? { month: "2-digit", year: "numeric" } : { day: "2-digit", month: "2-digit" });
  const ymarken = [0.25, 0.5, 0.75].map(f => {
    const py = T + f * (H - T - B);
    return `<span class="ks-graph__marke-y" style="top:${py.toFixed(1)}px">${window.ksGeld(yMax - f * (yMax - yMin), true, { kurz: true, roh: true }).replace(/\s?€/, "")}</span>`;
  }).join("");
  const idx = sicht.length > 1 ? [...new Set([0, Math.floor((sicht.length - 1) / 2), sicht.length - 1])] : [0];
  const xmarken = idx.map(i => {
    const stelle = sicht.length === 1 ? "left:50%;transform:translateX(-50%)"
      : `left:${xProz(i).toFixed(2)}%;transform:translateX(${i === 0 ? "0" : i === sicht.length - 1 ? "-100%" : "-50%"})`;
    return `<span class="ks-graph__marke-x" style="${stelle}">${datumKurz(sicht[i].d, tSpanne > 1000 * 3600 * 24 * 180)}</span>`;
  }).join("");
  const knoepfe = ZEITRAEUME.map(([l, t]) => `<button class="ks-graph__schalter-knopf${t === tage ? " ks-graph__schalter-knopf--aktiv" : ""}" data-befehl="zeitraum" data-tage="${t ?? ""}">${l}</button>`).join("");
  // Zukauf gegen Markt (19.09.2026, Marks Bild: "nichts anderes wie bei aktien"). Ein
  // Depotwert steigt auch, wenn man einzahlt - das ist keine Rendite. `einsatz` ist die
  // Summe der Kaufpreise im Bestand: Sie bewegt sich NUR durch Kauf und Verkauf, nie durch
  // den Markt. Was von der Veraenderung uebrig bleibt, ist Markt.
  //
  // Die Zeile erscheint nur, wenn BEIDE Messpunkte einen Einsatz tragen (die 367 alten
  // Zeilen tun das nicht) und sich der Bestand ueberhaupt geaendert hat - sonst ist die
  // ganze Bewegung Markt und die Aufschluesselung waere nur Rauschen.
  // Seit 19.09.2026 zeigt die gruene Zahl die MARKTBEWEGUNG, nicht die Veraenderung des
  // Depotwerts (Marks Fall: eine geloeschte Karte liess die Kurve abstuerzen - "das macht
  // Sinn das es dann auch so drastisch faellt oder?"). Ein Kauf ist eine Einzahlung, ein
  // Verkauf eine Auszahlung; beides ist keine Wertentwicklung, und genau das steht als
  // Ueberschrift darueber. Die KURVE bleibt der Depotwert - sie zeigt, was die Sammlung
  // wert ist, und ihre Farbe folgt ihr.
  //
  // Laesst sich nicht trennen (alte Zeilen ohne `einsatz`), steht die Gesamtveraenderung da
  // wie bisher - aber mit dem Zusatz "inkl. Zu- und Abgang". Eine Zahl, die aussieht wie
  // bereinigt, es aber nicht ist, waere eine Behauptung.
  // `markt` ist eine aufaddierte Reihe (Spalte 5 der Datei) - es zaehlt allein die Differenz
  // zwischen zwei Punkten. Was von der Gesamtveraenderung uebrig bleibt, ist Kauf und
  // Verkauf; so herum braucht es keinen einzigen gepflegten Kaufpreis.
  const markt = (erster.markt != null && heute.markt != null) ? heute.markt - erster.markt : null;
  const zufluss = markt == null ? null : diff - markt;
  const wert = markt ?? diff;
  const wertPos = wert >= 0;
  const wertProz = erster.w ? wert / erster.w * 100 : 0;
  // Klartext statt Buchhalterdeutsch (19.09.2026, Marks Wort: "ehrlich gesagt habe ich von
  // solchen rechnereien absolut keine ahnung"). Wer das nicht auf Anhieb versteht, versteht
  // auch keine Kaeufer-Dokumentation dazu - die Zeile muss ohne Erklaerung tragen. Hier
  // stand zuerst "inkl. Zu- und Abgang" bzw. "dazu +200,00 € durch Kauf und Verkauf".
  const geld = (betrag) => window.ksGeld(Math.abs(betrag), true, { roh: true });
  const aufteilung = zufluss == null
      ? `<span class="ks-graph__aufteilung">gekaufte und verkaufte Karten sind hier noch mitgerechnet</span>`
    : Math.abs(zufluss) < 0.005 ? ""
    : zufluss > 0
      ? `<span class="ks-graph__aufteilung">dazu ${geld(zufluss)} für Karten, die du gekauft hast</span>`
      : `<span class="ks-graph__aufteilung">ohne ${geld(zufluss)} für Karten, die nicht mehr in der Sammlung sind</span>`;
  const veraenderung = sicht.length < 2
    ? `<span class="ks-graph__delta" style="color:var(--still)">noch keine Vergleichsdaten im Zeitraum</span>`
    // "seit 14.09.2025" ist am 19.09.2026 auf Marks Wort entfallen ("und hier kann das datum
    // auch raus?"): Welcher Zeitraum gemeint ist, sagt der aktive Schalter rechts daneben.
    // Die Klasse .ks-graph__seit bleibt in oberflaeche.css stehen.
    : `<span class="ks-graph__delta ${wertPos ? "ks-graph__delta--plus" : "ks-graph__delta--minus"}">${wertPos ? "+" : "−"}${window.ksGeld(Math.abs(wert), true, { roh: true })} · ${wertPos ? "+" : "−"}${Math.abs(wertProz).toFixed(1).replace(".", ",")} %</span>${aufteilung}`;
  return `<div class="ks-flaeche__kopf"><div>
      <!-- Sagt jetzt die Spanne ("seit 366 Tagen"), nicht die Zahl der Zeilen: Die Erfolge-Seite
           misst "Ein Monat / Ein Jahr Verlauf" an derselben Groesse, und bei Luecken in der Kurve
           behaupteten beide Verschiedenes (gemeldet 16.09.2026). Wie viele Messpunkte darin
           liegen, zeigt der Graph selbst. -->
      <!-- "· seit 370 Tagen" ist am 19.09.2026 auf Marks Wort entfallen ("das kann raus") -
           dasselbe wie beim Datum in der Delta-Zeile: Der aktive Schalter rechts sagt schon,
           welcher Zeitraum gemeint ist. Bei nur EINEM Messpunkt bleibt der Hinweis stehen,
           denn dann zeigt die Kurve nichts, was der Schalter erklaeren wuerde.
           ACHTUNG, keine Backticks in Kommentaren INNERHALB dieses Template-Strings: sie
           beenden ihn, und der Block stirbt still (hier passiert, 19.09.2026). -->
      <div class="ks-kopf__label">Wertentwicklung${punkte.length < 2 ? " · erster Eintrag" : ""}</div>
      <div class="ks-graph__summe">${window.ksGeld(heute.w, true, { roh: true })}</div><div>${veraenderung}</div>
    </div><div class="ks-graph__schalter">${knoepfe}</div></div>
    <div class="ks-graph__buehne">
      <svg class="ks-graph__bild" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${farbe}" stop-opacity="0.35"/><stop offset="1" stop-color="${farbe}" stop-opacity="0"/></linearGradient></defs>
        ${[0.25, 0.5, 0.75].map(f => `<line class="ks-graph__raster" x1="${L}" x2="${W - R}" y1="${(T + f * (H - T - B)).toFixed(1)}" y2="${(T + f * (H - T - B)).toFixed(1)}"/>`).join("")}
        ${flaeche ? `<path d="${flaeche}" fill="url(#v)"/>` : ""}
        ${sicht.length > 1 ? `<path d="${pfad}" fill="none" stroke="${farbe}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>` : ""}
        ${punkteSvg}</svg>
      ${ymarken}${xmarken}
      <div class="ks-graph__kreuz"><div class="ks-graph__kreuz-linie"></div><div class="ks-graph__kreuz-punkt" style="background:${farbe}"></div><div class="ks-graph__kreuz-tip"></div></div>
    </div>`;
};

/* ---- Kacheln und Liste ---------------------------------------------------------------------- */
// Ohne `ziel` wird aus der Kachel ein <div> statt eines <a> - ein Knopf IN einem Link ist
// ungueltiges HTML, und die Kachel mit dem Preis-Knopf braucht keinen Weg ins Album.
const kachel = (ziel, label, zahlText, detail, klein) => {
  const inneres = `<div class="ks-kachel__label">${label}</div>
   <div class="ks-kachel__zahl${klein ? " ks-kachel__zahl--klein" : ""}">${zahlText}</div>
   <div class="ks-kachel__detail">${detail}</div>`;
  return ziel ? `<a class="ks-kachel" href="#" data-ziel="${ziel}">${inneres}</a>`
              : `<div class="ks-kachel">${inneres}</div>`;
};

// Wert-Regel nur an einer Stelle: window.ksWert in rahmen.js (Fehlermuster 11).
// Der ganze Rueckgabewert, nicht nur `gesamt` - die Zeile braucht auch `hatWert`, sonst
// schreibt sie "0,00 €" an eine Karte, fuer die es noch gar keinen Preis gibt.
const kartenWert = (k) => window.ksWert(k, leer(k.preis) ? null : zahl(k.preis));
const top = karten.sort(k => -kartenWert(k).gesamt).slice(0, 5);
// Bildquelle kommt aus rahmen.js (window.ksBild), samt Werbemodus.
const bild = (k) => window.ksBild(k, k.bild, "");
// Set, Nummer und Grading mit Mittelpunkt verbinden - fehlende Teile fallen samt
// ihrem Trennzeichen weg, statt ein hängendes " · " zu hinterlassen.
const meta = (k) => {
  const teile = [window.ksSetName(k), k.nummer];
  // Grading über `gezeigte` wie Album-Chip und Karten-Kopf (Regel in window.ksWert):
  // der Bestand, bei vollständig verkaufter Karte deren verkaufte Exemplare. Direkt
  // über ksExemplare gelesen zählte hier auch ein verkauftes Exemplar mit.
  // Zusammengefasst wird mit window.ksGradText - das erste gegradete Exemplar zu nehmen
  // behauptete "PSA 9", wo die Karten-Ansicht "1 von 2 gegradet" sagte.
  const wk = window.ksWert(k, null);
  // Die Stueckzahl gehoert dazu, weil der Betrag rechts die SUMME aller Exemplare im
  // Bestand ist (gemeldet 16.09.2026): Die Liste heisst "Teuerste Karten", und bei zehn
  // Exemplaren einer 200-€-Karte staende dort "2.000,00 €" ueber einer Karte, die 200 €
  // wert ist. Das Album setzt an derselben Stelle den Chip "×2" und schreibt "gesamt".
  if (wk.stueck > 1) teile.push(`${wk.stueck} Exemplare`);
  const g = window.ksGradText(wk.gezeigte);
  if (g) teile.push(g);
  return teile.filter(x => !leer(x)).map(esc).join(" · ");
};

const liste = top.length === 0 ? `<div class="ks-karte__leer">Noch keine Karten.</div>` : top.map((k, i) => {
  const b = bild(k), w = kartenWert(k);
  return `<a class="ks-zeile" href="#" data-ziel="${esc(k.file.path)}">
    ${b ? `<img class="ks-zeile__bild" src="${esc(b)}" alt="">` : `<span class="ks-zeile__bild"></span>`}
    <span class="ks-zeile__rang">${i + 1}</span>
    <span class="ks-zeile__text">
      <span class="ks-zeile__name">${esc(window.ksKartenName(k) ?? k.file.name)}</span>
      <span class="ks-zeile__meta">${meta(k)}</span>
    </span>
    <span class="ks-zeile__wert">${window.ksGeld(w.gesamt, w.hatWert, { leer: "kein Preis", ab: w.ohnePreis > 0 })}</span></a>`;
}).join("");

/* ---- Preisbewegung: Tagespreis gegen den 30-Tage-Schnitt --------------------------------- */
// Beide Zahlen liegen in jeder Karte, die das Preis-Skript erfasst hat. Karten mit
// wert_manuell bleiben draussen: dort gilt der selbst gesetzte Wert, keine Marktbewegung.
// Zwei Zeitraeume, mehr gibt Cardmarket nicht her (19.09.2026, Marks Frage "macht statische
// 30 tage hier sinn? oder auch filter einfuehren?"): In jeder Notiz stehen `preis_tag`
// (avg1), `preis_7` (avg7) und `preis_30` (avg30) - alles andere muesste erfunden werden.
// 7 Tage zeigt den Ausschlag, 30 Tage den Trend.
const BEWEGUNGSZEITRAEUME = [["7 T", 7, "preis_7"], ["30 T", 30, "preis_30"]];
const bewegungListe = (tage) => {
  const feld = (BEWEGUNGSZEITRAEUME.find(([, t]) => t === tage) ?? BEWEGUNGSZEITRAEUME[1])[2];
  return karten
    .map(k => {
      const tagesPreis = zahl(k.preis_tag), schnitt = zahl(k[feld]);
      if (window.ksExemplare(k).some(e => e.wert_manuell != null) || !tagesPreis || !schnitt) return null;
      return { k, tagesPreis, schnitt, proz: (tagesPreis - schnitt) / schnitt * 100 };
    })
    .array()                                   // Dataview gibt ein DataArray zurück, kein echtes
    .filter(x => x && Math.abs(x.proz) >= 1)   // Array: dessen slice() kennt kein reverse(), und
    .sort((a, b) => b.proz - a.proz);          // sein sort() erwartet eine Schlüssel-, keine Vergleichsfunktion
};

const bewegungsZeile = (x) => {
  const b = bild(x.k), hoch = x.proz >= 0;
  return `<a class="ks-zeile" href="#" data-ziel="${esc(x.k.file.path)}">
    ${b ? `<img class="ks-zeile__bild" src="${esc(b)}" alt="">` : `<span class="ks-zeile__bild"></span>`}
    <span class="ks-zeile__text">
      <span class="ks-zeile__name">${esc(window.ksKartenName(x.k) ?? x.k.file.name)}</span>
      <span class="ks-zeile__meta">${window.ksGeld(x.schnitt, true, { roh: true })} → ${window.ksGeld(x.tagesPreis, true, { roh: true })}</span>
    </span>
    <span class="ks-zeile__wert ${hoch ? "ks-zeile__wert--plus" : "ks-zeile__wert--minus"}">${hoch ? "+" : "−"}${Math.abs(x.proz).toFixed(0)} %</span></a>`;
};

// Fuenf je Seite (Marks Wort 19.09.2026: "lass uns vielleicht maximal 5 auf jeder seite
// anzeigen"), vorher vier.
const bewegungHtml = (tage) => {
  const liste = bewegungListe(tage);
  if (liste.length < 2) return `<div class="ks-karte__leer">Noch zu wenig Preisdaten. Jeder Preislauf füllt „Tag", „7 Tage" und „30 Tage" nach.</div>`;
  const rauf = liste.filter(x => x.proz > 0).slice(0, 5);
  const runter = liste.filter(x => x.proz < 0).slice(-5).reverse();
  const spalte = (titel, l, leerText) => `<div class="ks-bewegung__spalte">
      <div class="ks-kopf__label">${titel}</div>
      ${l.length ? l.map(bewegungsZeile).join("") : `<div class="ks-karte__leer">${leerText}</div>`}
    </div>`;
  return `<div class="ks-bewegung">
    ${spalte("Gestiegen", rauf, "keine Karte ist teurer geworden")}
    ${spalte("Gefallen", runter, "keine Karte ist billiger geworden")}
  </div>`;
};

// Kopf der Flaeche: Schalter rechts wie beim Graphen, Satz und Zaehler ziehen mit.
const bewegungKopf = (tage) => {
  const knoepfe = BEWEGUNGSZEITRAEUME.map(([l, t]) => `<button class="ks-graph__schalter-knopf${t === tage ? " ks-graph__schalter-knopf--aktiv" : ""}" data-befehl="bewegungszeitraum" data-tage="${t}">${l}</button>`).join("");
  return `<div class="ks-flaeche__kopf"><span class="ks-flaeche__titel">Größte Bewegung</span>
      <div class="ks-kopf__rechts">
        <!-- Der Zaehler "60 verschiedene in Bewegung" ist am 19.09.2026 auf Marks Wort
             entfallen ("raus damit"): Er zaehlte, wie viele Karten sich um mindestens ein
             Prozent bewegt haben - eine Zahl, die niemand braucht, wenn darunter die
             groessten fuenf je Richtung stehen. -->
        <span class="ks-kopf__label">heutiger Preis gegen den Schnitt der letzten ${tage} Tage</span>
        <div class="ks-graph__schalter">${knoepfe}</div>
      </div></div>`;
};

const jetzt = () => {
  const j = new Date();
  return `${j.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })} · ${j.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
};
const gruss = () => { const h = new Date().getHours(); return h < 5 ? "Guten Abend" : h < 11 ? "Guten Morgen" : h < 14 ? "Guten Mittag" : h < 18 ? "Guten Nachmittag" : "Guten Abend"; };
// Der Name kommt vom Rechner des Nutzers, nie aus einer festen Zeichenkette - sonst begruesst
// das Vault jeden mit dem Namen dessen, der es gebaut hat. Der Pfad ist die einzige Quelle, die
// ohne electron erreichbar ist (require("electron") ist gesperrt): /Users/<name> auf macOS,
// /home/<name> auf Linux, C:\\Users\\<name> auf Windows. Findet sich nichts, bleibt es bei der
// blossen Tageszeit - lieber keine Anrede als eine falsche oder "undefined".
// VERANKERT am Pfadanfang (^): unverankert griff der Ausdruck an jeder Stelle des Pfades, und
// /Volumes/Extern/home/kartensammlung gruesste mit "Guten Abend, Kartensammlung" (gemeldet
// 15.09.2026). Erlaubt sind nur die drei echten Benutzerordner - dazu WSL, wo das Windows-
// Laufwerk unter /mnt/<buchstabe> hängt.
const nutzer = () => {
  const pfad = app.vault.adapter.basePath || "";
  const t = pfad.match(/^(?:[A-Za-z]:)?(?:[\\/]mnt[\\/][a-z])?[\\/](?:Users|home)[\\/]([^\\/]+)/i);
  if (!t) return "";
  const n = t[1];
  return n.charAt(0).toUpperCase() + n.slice(1);
};
// Schalter (Auftrag A6): Steht im Kopfblock von Dashboard.md `anrede: aus`, erscheint nur die
// Tageszeit. Fehlt das Feld, wird der Name gezeigt - das ist die Voreinstellung für Käufer.
// Im Demo-Vault steht der Schalter auf "aus", damit auf Werbebildern kein Name steht.
const anredeAus = String(dv.current()?.anrede ?? "").trim().toLowerCase() === "aus";
// esc(): der Name ist Fremddaten aus dem Dateisystem - ein Ordner "<b>chef</b>" würde sonst als
// Markup geparst und der Kopf zerbraeche, "&" kaeme unmaskiert ins HTML (gemeldet 15.09.2026).
const anrede = () => { const n = anredeAus ? "" : nutzer(); return n ? `${gruss()}, ${esc(n)}` : gruss(); };

const seite = (tage) => `<div class="ks-seite">
  ${window.ksNaviHtml("Dashboard.md")}
  <div class="ks-seite__inhalt">
    <div class="ks-kopf">
      <div><div class="ks-kopf__label">Bindertresor · <span class="ks-kopf__uhr" style="font-variant-numeric:tabular-nums">${jetzt()}</span></div>
        <!-- 18.09.2026, Marks Wort "schmeiss bitte die begruessung raus": Hier stand
             die Tageszeit-Anrede. Sie war die einzige Kopfzeile im ganzen Vault, die
             nichts ueber die Sammlung sagte - Album zeigt den Gesamtwert, Sets die
             Anzahl, Erfolge den Fortschritt. Kein Ersatztitel: Jede Zahl, die hier
             stuende, steht schon in einer Kachel darunter.
             Die Funktionen gruss(), nutzer() und anrede() bleiben unberuehrt im Code,
             samt Schalter "anrede: aus" - sie werden nur nicht mehr aufgerufen. -->
        </div>
      <!-- Der Knopf "Preise aktualisieren" stand hier am 18.09.2026 abends fuer eine Stunde.
           Er steht jetzt in der Kachel, die den Stand zeigt (Marks Wort 19.09.2026). -->
      <div class="ks-kopf__label"><span class="ks-kopf__punkt"></span>Dashboard</div>
    </div>
    <div class="ks-flaeche" id="ks-graph">${graphHtml(tage)}</div>
    <div class="ks-kachelreihe">
      <!-- Ohne Fusszeilen (16.09.2026): Sie erklaerten, was die Zahl darueber schon sagt.
           Einzige Ausnahme bleibt der Hinweis auf fehlende Preise - er ist keine Erklaerung,
           sondern eine Warnung, dass der Gesamtwert unvollstaendig ist. -->
      <!-- Kein Betrag, solange keine einzige Karte einen Preis hat (gemeldet 16.09.2026):
           "Gesamtwert 0 €" ist eine Behauptung, kein Messwert - und es ist der erste
           Bildschirm jedes neuen Vaults, denn die Vorlage legt das Preisfeld leer an.
           Album, Sets und Karten-Ansicht sagen dort laengst "noch kein Preis"; hatWert aus
           window.ksWert unterscheidet genau das und stand hier bisher nur in der Rechnung
           (mitPreis), nicht in der Anzeige. -->
      ${kachel("Album.md", "Gesamtwert", window.ksGeld(wert, mitPreis, { kurz: true, ab: summeUnvollstaendig }),
               ohnePreis ? `${window.ksVerschieden(ohnePreis)} noch ohne Preis` : "")}
      ${kachel("Album.md", "Karten", String(stueck), "")}
      <!-- "Gegradet" und "Eingekauft" entfernt (16.09.2026): Die eine Zahl sagt nichts ueber
           die Sammlung, die andere haengt an Kaufpreisen, die kaum jemand vollstaendig
           pflegt. Beides steht weiter in den Filtern und in der Karten-Ansicht. -->
      <!-- Hiess bis 18.09.2026 abends "Preis-Stand" und zeigte das Datum, an dem CARDMARKET
           zuletzt gerechnet hat. Nach einem Klick blieb dort der Vortag stehen - richtig
           gerechnet, aber es beantwortet nicht die Frage, die man nach dem Klick stellt
           (Marks Wort: "muss natuerlich auch das datum aktuell sein, am besten mit
           Uhrzeit"). Die Kachel zeigt den eigenen Abruf.
           Zwischenname "Zuletzt geholt" - Marks Wort 19.09.2026: "was ist denn das fuer ein
           beschissener name man? mach doch einfach 'Preise zuletzt aktualisiert' und den
           button dafuer haust du in die kachel rein." Stand und Knopf gehoeren zusammen:
           Wer das Datum liest, will es aktualisieren. Kein Weg ins Album mehr - dafuer sind
           die beiden Kacheln links da.
           Bis 19.09.2026 stand hier der AELTESTE Abruf, waehrend die Beschriftung "zuletzt"
           sagt (Durchgang 20, Befund 3). Seither der JUENGSTE - siehe letzterAbruf oben.
           ACHTUNG: In diesem HTML-Kommentar steht kein Backtick. Er liegt in einem Template-
           String und beendete ihn - genau daran ist diese Datei am 19.09.2026 gestorben. -->
      ${kachel(null, "Preise zuletzt aktualisiert", dmzUhr(letzterAbruf),
               `<button type="button" class="ks-knopf ks-kachel__knopf${window.ksPreislauf.laeuft ? " ks-knopf--fortschritt" : ""}"
                  style="--ks-fortschritt:${window.ksPreislauf.laeuft ? window.ksPreislaufProzent() : 0}%"
                  data-befehl="preise"${window.ksPreislauf.laeuft ? " disabled" : ""}>${window.ksPreislaufText()}</button>`, true)}
      <!-- Kachel "Verkauft" entfernt (16.09.2026): Bei wenigen Verkaeufen sagt sie zu wenig,
           und ihre Gewinn-Rechnung war falsch - sie zog von ALLEN Erloesen nur EINEN Teil der
           Einkaeufe ab. Verkaufte Exemplare bleiben in der Karten-Ansicht und im Album-Filter
           sichtbar; eine eigene Verkaufsuebersicht waere der richtige Ort dafuer. -->
    </div>
    <div class="ks-flaeche" id="ks-bewegung">
      ${bewegungKopf(bewegungsTage)}
      ${bewegungHtml(bewegungsTage)}
    </div>
    <div class="ks-flaeche">
      <div class="ks-flaeche__kopf"><span class="ks-flaeche__titel">Teuerste Karten</span>
        <a class="ks-knopf" href="#" data-ziel="Album.md">Album →</a></div>
      ${liste}
    </div>
  </div>
</div>`;

let gewaehlt = 30;
// Der Zeitraum der Bewegungs-Liste, unabhaengig vom Zeitraum des Graphen: Der eine sagt,
// wie lange die Kurve zurueckreicht, der andere, wogegen der Tagespreis verglichen wird.
let bewegungsTage = 30;
await window.ksRahmen(dv, {
  html: seite(gewaehlt),
  hoehe: "calc(100vh - 144px)",
  befehl: async (name, el, dok) => {
    if (name === "zeitraum") {
      gewaehlt = el.dataset.tage === "" ? null : Number(el.dataset.tage);
      dok.getElementById("ks-graph").innerHTML = graphHtml(gewaehlt);
      fadenkreuz(dok);
      markenAufraeumen(dok);
      return;
    }
    if (name === "bewegungszeitraum") {
      bewegungsTage = Number(el.dataset.tage);
      const fl = dok.getElementById("ks-bewegung");
      if (fl) fl.innerHTML = bewegungKopf(bewegungsTage) + bewegungHtml(bewegungsTage);
      return;
    }
    if (name !== "preise") return;
    // Die Sperre liegt am FENSTER, nicht am Knopf: Waehrend des Laufs baut Dataview die
    // Seite neu, und dieser Knopf hier ist dann ein totes Element. `ksPreiseZiehen` weist
    // einen zweiten Lauf selbst ab und gibt null zurueck - hier wird nur nicht mehr
    // geklickt, als noetig.
    if (window.ksPreislauf.laeuft) return;
    el.disabled = true;
    try {
      // Den Fortschritt immer am GERADE vorhandenen Knopf zeigen, nicht am geklickten -
      // nach einem Neuaufbau ist das ein anderes Element (und es bringt seinen Stand aus
      // window.ksPreislaufText schon selbst mit).
      const s = await window.ksPreiseZiehen(() => window.ksPreisKnopfZeigen(dok.querySelector('[data-befehl="preise"]')));
      if (!s) return;   // es lief schon einer
      // Was NICHT klappte, steht in derselben Meldung - sonst sieht ein halber Lauf aus
      // wie ein ganzer.
      const rest = [s.ohneKennung && `${s.ohneKennung} ohne Kennung`,
                    s.ohnePreis && `${s.ohnePreis} ohne Cardmarket-Preis`,
                    s.fehler && `${s.fehler} nicht erreichbar`,
                    // Wenn TCGdex gebremst hat, gehoert das in die Meldung: Sonst wundert
                    // sich nur jemand, warum derselbe Lauf heute viel laenger dauerte.
                    s.gebremst && "TCGdex hat gebremst, der Rest lief langsamer"].filter(Boolean);
      // Hier stand bis 19.09.2026 "n von m Karten aktualisiert" (Durchgang 20, Befund 1).
      // `s.gesamt` ist `dateien.length` aus ksPreiseZiehen, also die Zahl der NOTIZEN - ein
      // Preislauf geht je Notiz einmal hinaus, nicht je Exemplar. Nach Marks Wortregelung
      // vom 18.09.2026 heisst diese Menge "verschiedene", nicht "Karten".
      new Notice(`${s.neu} von ${s.gesamt} verschiedenen aktualisiert · Gesamtwert ${window.ksGeld(s.wert, true, { roh: true })}`
        + (rest.length ? `\n${rest.join(" · ")}` : ""));
    } catch (err) {
      console.error("ks: Preislauf", err);
      new Notice(window.ksFehlerText(err, "Der Preislauf ist fehlgeschlagen. Der Grund steht in der Konsole."));
    } finally {
      // Wieder am gerade vorhandenen Knopf, aus demselben Grund wie oben. ksPreisKnopfZeigen
      // liest den (inzwischen beendeten) Lauf und raeumt Text, Sperre und Balken zusammen auf.
      window.ksPreisKnopfZeigen(dok.querySelector('[data-befehl="preise"]') ?? el);
    }
  },
  fertig: (dok, rahmen) => {
    fadenkreuz(dok);
    markenAufraeumen(dok);
    requestAnimationFrame(() => markenAufraeumen(dok));
    dok.defaultView.addEventListener("resize", () => markenAufraeumen(dok));
    // Uhr im Rahmen weiterzaehlen lassen - Zaehler je Instanz, nicht global.
    // Abbruch am RAHMEN, nicht am Uhr-Element: dessen isConnected bleibt true, weil es im
    // alten Rahmendokument weiter hängt, auch wenn der Rahmen laengst aus dem Fenster
    // entfernt ist. Mit dieser Bedingung blieb je Dashboard-Besuch ein Sekundentakt auf
    // einem toten Dokument zurück - vier Besuche, vier laufende Uhren.
    const uhr = setInterval(() => {
      const el = dok.querySelector(".ks-kopf__uhr");
      if (!el || !rahmen.isConnected) { clearInterval(uhr); return; }
      const t = jetzt(); if (el.textContent !== t) el.textContent = t;
    }, 1000);
  },
});

// Marken nach dem Rendern aufraeumen. Beides lässt sich nicht vorher ausrechnen: Die
// Marken sitzen prozentual, ihre Textbreite steht erst im Layout fest.
//  - Datumsmarken: die mittlere fällt weg, wenn sie eine der aeusseren berührt
//    (bei 375 ueberlappten "10.09." und "15.09." um 7 px).
//  - Wertmarken: ihr Kasten ist 7 % breit, der Text wächst nicht mit - unter einer
//    gewissen Breite ragte er in die Zeichenflaeche und stand auf der Kurve (gemessen
//    ab Fenster 640 im echten Vault, ab 768 im Demo mit fuenfstelliger Zahl). Der Kasten
//    meldet das nicht, darum wird die Textbreite selbst gemessen.
function markenAufraeumen(dok) {
  const x = [...dok.querySelectorAll(".ks-graph__marke-x")];
  x.forEach(e => { e.hidden = false; });
  for (let i = 1; i < x.length - 1; i++) {
    const r = x[i].getBoundingClientRect();
    const links = x[i - 1].getBoundingClientRect().right, rechts = x[x.length - 1].getBoundingClientRect().left;
    if (r.left < links + 6 || r.right > rechts - 6) x[i].hidden = true;
  }

  const y = [...dok.querySelectorAll(".ks-graph__marke-y")];
  const flaeche = dok.querySelector(".ks-graph__buehne");
  if (!flaeche || !y.length) return;
  // Sichtbarkeit über visibility, nicht über hidden: ein hidden-Element hat keine Masse
  // mehr, der naechste Lauf würde 0 messen und die Marken faelschlich zurueckholen.
  y.forEach(e => { e.style.visibility = ""; });
  // Nicht rechnen, sondern messen: ragt die Textkante über den Beginn der Zeichenflaeche
  // (x = 7 %)? Ein Aufschlag für das Polster wäre eine Annahme - die Tinte selbst ist
  // die Größe, auf die es ankommt. Eine Marke zu weit genuegt, dann fallen alle weg.
  const r = flaeche.getBoundingClientRect(), grenze = r.left + r.width * 0.07;
  const raus = y.some(e => {
    const b = dok.createRange(); b.selectNodeContents(e);
    return b.getBoundingClientRect().right > grenze;
  });
  if (raus) y.forEach(e => { e.style.visibility = "hidden"; });
}

function fadenkreuz(dok) {
  const flaeche = dok.querySelector(".ks-graph__buehne"), fk = dok.querySelector(".ks-graph__kreuz");
  if (!flaeche || !fk) return;
  const tage = gewaehlt;
  const tag = (iso) => new Date(iso + "T12:00:00");
  const heute = punkte[punkte.length - 1];
  let sicht = punkte;
  if (tage && heute) { const ab = tag(heute.d); ab.setDate(ab.getDate() - tage); sicht = punkte.filter(p => tag(p.d) >= ab); }
  if (sicht.length < 2) return;
  const tVon = tag(sicht[0].d).getTime(), tSpanne = (tag(sicht[sicht.length - 1].d).getTime() - tVon) || 1;
  const L = 56 / 800, R = 8 / 800;
  const stellen = sicht.map(p => L + (tag(p.d).getTime() - tVon) / tSpanne * (1 - L - R));
  const linie = fk.querySelector(".ks-graph__kreuz-linie"), pkt = fk.querySelector(".ks-graph__kreuz-punkt"), tip = fk.querySelector(".ks-graph__kreuz-tip");
  const min = Math.min(...sicht.map(p => p.w)), max = Math.max(...sicht.map(p => p.w));
  const spanne = (max - min) || Math.max(max * 0.1, 1), yMin = min - spanne * 0.15, yMax = max + spanne * 0.15;
  flaeche.onmousemove = (e) => {
    const r = flaeche.getBoundingClientRect();
    const rel = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    let i = 0, naechste = Infinity;
    stellen.forEach((st, j) => { const ab = Math.abs(st - rel); if (ab < naechste) { naechste = ab; i = j; } });
    const p = sicht[i];
    fk.classList.add("ks-graph__kreuz--an");
    linie.style.left = pkt.style.left = `${(stellen[i] * 100).toFixed(2)}%`;
    pkt.style.top = `${(14 + (yMax - p.w) / (yMax - yMin) * 180).toFixed(1)}px`;
    tip.textContent = `${dm(p.d)} · ${window.ksGeld(p.w, true, { roh: true })}`;
    const halb = tip.getBoundingClientRect().width / 2 + 4;
    tip.style.left = `${Math.min(r.width - halb, Math.max(halb, stellen[i] * r.width)).toFixed(1)}px`;
  };
  flaeche.onmouseleave = () => fk.classList.remove("ks-graph__kreuz--an");
}
