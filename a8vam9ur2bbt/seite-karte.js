// Karten-Ansicht im Rahmen (15.09.2026). Aufruf aus der Notiz:
//   await dv.view("Skripte/seite-karte");
await dv.view("Skripte/rahmen");

const p = dv.current();
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
// Grading und Note verbinden - fehlt die Note, bleibt kein Leerzeichen hängen.
const grad = (g, n) => [g, n].filter(x => x != null && x !== "").map(esc).join(" ");
const leer = (v) => v == null || v === "" || (Array.isArray(v) && !v.length);
// Zahl aus dem Kopfblock: DIE EINE Lesart aus rahmen.js (window.ksZahl) - leer und
// UNLESBAR sind `null`, nie 0. Bis 18.09.2026 stand hier `: 0`, und ein Kopfblock mit
// `preis: "12.50"` (in Anfuehrungszeichen) zeigte "0,00 €", waehrend preise.py 12,50 €
// in Wertverlauf.csv schrieb (Durchgang 17, Befund 2). Die Konstante bleibt stehen,
// damit die Aufrufe unveraendert lesen - sie zeigt nur nicht mehr auf eine eigene Regel.
const zahl = (v) => window.ksZahl(v);
const euro = (n) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const datum = (v) => leer(v) ? null : (v.toFormat ? v.toFormat("dd.MM.yyyy") : String(v));
// Für <input type="date"> braucht es ISO. Gespeichert ist ISO (echtes YAML-Datum), aber
// aus der Zeit des freien Textfelds kann noch "11.09.2026" in einer Notiz stehen - das
// wird hier mitgelesen, sonst stünde das Feld leer, während das Exemplar weiter als
// verkauft zählt.
// Was sich NICHT umrechnen lässt ("bald", "September 2026"), gibt "" zurück - ein
// <input type="date"> zeigt jeden anderen Wert ohnehin als leeres Feld an, ohne ein Wort
// dazu (gemeldet 16.09.2026). Verschwiegen wird es trotzdem nicht: `datumRoh` liefert den
// Text aus der Notiz, und die Zeile stellt ihn unter das Feld. Sonst stünde da eine
// ausgegraute Zeile mit der Marke "verkauft", ein Feld "Verkaufspreis" - und ein leeres
// "Verkauft am", ohne dass jemand erführe, woran es liegt.
const iso = (v) => {
  if (leer(v)) return "";
  if (v.toFormat) return v.toFormat("yyyy-MM-dd");
  const t = String(v).trim();
  const m = t.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(t.slice(0, 10)) ? t.slice(0, 10) : "";
};
const datumRoh = (v) => (leer(v) || iso(v)) ? null : String(v).trim();

const preis = leer(p.preis) ? null : zahl(p.preis);
// Wert-Regel nur an einer Stelle: window.ksWert in rahmen.js (Fehlermuster 11)
const w = window.ksWert(p, preis);
const exemplare = w.exemplare;
const imBestand = w.imBestand;
// Angaben ZUR KARTE (hier das Grading) zählen über den Bestand, nicht über die Liste -
// die Regel steht in window.ksWert (rahmen.js), damit Album und Dashboard dieselbe nehmen.
const gezeigte = w.gezeigte;
const anzahl = w.stueck;
// Wie viele Exemplare einen eigenen Wert tragen. Ein einziges davon darf die ganze Karte
// nicht als "manuell gesetzt" beschriften - beim Grading macht diese Seite es schon richtig
// ("1 von 2 gegradet"), beim Wert stand es bis 15.09.2026 pauschal da.
const manuellZahl = imBestand.filter((e) => e.wert_manuell != null).length;
const manuell = manuellZahl ? imBestand.find((e) => e.wert_manuell != null).wert_manuell : null;
// Aus Sicht des Sammlers geschrieben, nicht aus Sicht der Rechnung (gemeldet 16.09.2026:
// "schreib es fuer den User und nicht fuer Entwickler"). Er will wissen, woher die Summe
// kommt - nicht, welche Variable welchen Zustand hat.
const wertHerkunft = (n) => {
  if (n === 1) return manuellZahl === 1 ? "dein eigener Wert" : "aktueller Marktpreis";
  if (manuellZahl === 0) return `${n} Exemplare zum Marktpreis`;
  if (manuellZahl === n) return `${n} Exemplare mit deinem eigenen Wert`;
  return `${n} Exemplare, davon ${manuellZahl} mit deinem eigenen Wert`;
};
// Steht ein Exemplar ohne bekannten Preis dabei, ist die Summe darueber eine UNTERGRENZE
// und der Herkunftssatz muss es sagen (gemeldet 16.09.2026): Eine gegradete Karte mit
// eigenem Wert neben einem rohen Exemplar ohne Marktpreis zeigte den eigenen Wert als
// Gesamtwert, und das unbekannte Exemplar zaehlte stillschweigend als 0 €.
const wertSatz = (n) => w.ohnePreis
  ? `${wertHerkunft(n)} · ${w.ohnePreis} ${w.ohnePreis === 1 ? "Exemplar hat" : "Exemplare haben"} noch keinen Preis`
  : wertHerkunft(n);
// Zwei verschiedene Gründe für "kein Betrag", und sie sagen Verschiedenes: Entweder ist
// nichts mehr im Bestand, oder es gibt für diese Karte noch gar keinen Preis. Bis
// 16.09.2026 hing beides an derselben Bedingung, und die Kachel behauptete "0,00 € ·
// aktueller Marktpreis" für eine Karte ohne jeden Preis - also auf dem ersten Bildschirm
// jedes neuen Vaults, denn die Vorlage legt `preis:` leer an. `hatWert` kommt aus
// window.ksWert und unterscheidet genau das; Album und Sets nutzen es längst.
const wert = anzahl === 0 || !w.hatWert ? null : w.gesamt;
// KEINE Division mehr (gemeldet 16.09.2026): Hier stand `wert / anzahl`. Die Variable
// wird heute nicht ausgegeben - wer sie wiederbelebt, haette sonst den Album-Fehler
// mitgeholt und einen Durchschnitt gezeigt, den kein Exemplar traegt. Die echten
// Einzelwerte stehen in `w.einzel`, je Exemplar und in der Reihenfolge von `imBestand`.
const einzel = w.einzel.length ? w.einzel : [manuell ?? preis ?? null];
const gegradet = gezeigte.some((e) => e.grading);
const alleVerkauft = exemplare.length > 0 && imBestand.length === 0;

// Bildquelle: Netzadresse oder eigenes Foto als Wikilink
// Bildquelle kommt aus rahmen.js (window.ksBild), samt Werbemodus.
const bildQuelle = (v) => window.ksBild(p, v, p.file.path);
const src = bildQuelle(p.bild);

// Kaufpreis gegen Wert (18.09.2026, Marks Wort: "unten steht kaufpreis 50000 und es passiert
// rein gar nichts rechnerisch"). Bis dahin hatte der Kaufpreis keinen Verbraucher ausser
// dem Erfolg "Einkaufsbuch gefuehrt" - die Kachel "Eingekauft" war am 16.09.2026 entfallen
// und die Zeile hier als offene Entscheidung geparkt (Fuer-Mark, C6). Gerechnet wird NUR
// ueber Exemplare, die einen Kaufpreis UND einen bekannten Wert tragen, und es steht dabei,
// ueber wie viele - sonst wirkt eine halb gepflegte Sammlung wie ein Verlust.
const kaufDelta = (kauf, wert) => (kauf == null || wert == null) ? null : wert - kauf;
const deltaHtml = (d, klasse) => d == null ? "" : `<span class="${klasse} ${klasse}--${d >= 0 ? "plus" : "minus"}">${d >= 0 ? "+" : "−"}${window.ksGeld(Math.abs(d), true, { roh: true })}</span>`;
const kaufPaare = imBestand.map((e, i) => ({ e, v: w.einzel[i] })).filter((x) => x.e.kaufpreis != null);
const kaufBekannt = kaufPaare.filter((x) => x.v != null);
const gekauft = kaufBekannt.reduce((s, x) => s + x.e.kaufpreis, 0);
const heuteWert = kaufBekannt.reduce((s, x) => s + x.v, 0);

const kachel = (label, gross, detail, klasse = "") =>
  `<div class="ks-karte__kachel ${klasse}"><div class="ks-karte__label">${label}</div>
   <div class="ks-karte__zahl">${gross}</div>${detail ? `<div class="ks-karte__detail">${detail}</div>` : ""}</div>`;

// Steht NACH `kachel`, weil die Kachel sofort gebaut wird (Fehlermuster 5: const vor der
// ersten Benutzung laesst den Block still sterben - so passiert am 18.09.2026).
// Eigene Kachel statt einer Zeile in der Wert-Kachel (Marks Wort 18.09.2026: "super
// verwirrend") - dort standen zwei "heute"-Betraege untereinander, einer ueber alle
// Exemplare, einer nur ueber die mit Kaufpreis. Jetzt hat der Einkauf seine eigene Zahl
// und seinen eigenen Vergleich; die Wert-Kachel bleibt, was sie war.
const gekauftAlle = kaufPaare.reduce((s, x) => s + x.e.kaufpreis, 0);
const kaufKachel = !kaufPaare.length ? "" : (() => {
  const menge = kaufPaare.length < imBestand.length ? `${kaufPaare.length} von ${imBestand.length} Exemplaren` : (imBestand.length === 1 ? "" : `alle ${imBestand.length} Exemplare`);
  const detail = !kaufBekannt.length
    ? [menge, "heutiger Wert noch unbekannt"].filter(Boolean).join(" · ")
    : [menge, `heute ${window.ksGeld(heuteWert, true, { roh: true })}`, deltaHtml(heuteWert - gekauft, "ks-karte__delta")].filter(Boolean).join(" · ");
  return kachel("Eingekauft", window.ksGeld(gekauftAlle, true, { roh: true }), detail);
})();

// Cardmarket-Kacheln, kleinster Schnitt hervorgehoben
const CM = [["1 Tag", p.preis_tag], ["7 Tage", p.preis_7], ["30 Tage", p.preis_30], ["Trend", p.preis_trend], ["ab", p.preis_min]];
const schnitte = CM.slice(0, 4).map(([, v]) => leer(v) ? null : zahl(v)).filter(v => v != null);
const kleinster = schnitte.length ? Math.min(...schnitte) : null;
const cmFelder = CM.map(([name, v]) => {
  if (leer(v)) return "";
  const z = zahl(v);
  const aktiv = kleinster != null && z === kleinster && name !== "ab";
  return `<div class="ks-karte__cm-feld${aktiv ? " ks-karte__cm-feld--aktiv" : ""}"><div class="ks-karte__cm-label">${name}</div><div class="ks-karte__cm-wert">${window.ksGeld(z, true, { roh: true })}</div></div>`;
}).join("");

// Cardmarket-Sprachnummern kommen aus der einen Sprachtabelle in rahmen.js (18.09.2026).
const CM_SPRACHE = Object.fromEntries(Object.entries(window.ksSprachTabelle).map(([k, v]) => [k, v.cm]));
// Im Werbemodus bleibt der Knopf da (er gehört zur Oberflaeche), trägt aber weder den
// Haendlernamen noch einen Link dorthin - auf einem Werbebild hat beides nichts verloren.
const cmKnopf = leer(p.cardmarket_id) ? "" : (window.ksWerbemodus()
  ? `<span class="ks-knopf">Beim Händler ansehen →</span>`
  : `<a class="ks-knopf" target="_blank" rel="noopener" href="https://www.cardmarket.com/de/Pokemon/Products?idProduct=${esc(p.cardmarket_id)}&language=${CM_SPRACHE[String(p.sprache)] || 3}&minCondition=2">Bei Cardmarket öffnen →</a>`);

const cmKachel = preis == null
  ? kachel(window.ksQuelle(), `<span class="ks-karte__leer">–</span>`, "noch keine Preise geholt")
  : `<div class="ks-karte__kachel"><div class="ks-karte__label">${window.ksQuelle()}${datum(p.preis_stand) ? ` · Stand ${datum(p.preis_stand)}` : ""}</div>
     <div class="ks-karte__cm">${cmFelder}</div>
     <div class="ks-karte__fuss"><div class="ks-karte__detail">${manuellZahl === 0
        ? "Der blau umrandete Preis ist der niedrigste - mit ihm wird gerechnet."
        : manuellZahl === anzahl
        ? "Du hast den Wert selbst eingetragen. Die Preise stehen hier nur zum Vergleich."
        : "Bei einem Teil deiner Exemplare zählt dein eigener Wert, beim Rest der blau umrandete Preis."}</div>${cmKnopf}</div></div>`;

// Bearbeiten-Felder
const ZUSTAENDE = ["M", "NM-MT", "NM", "EX", "GD", "LP", "PL", "PO"];
// Feste Werte fuer Grading und Note (Marks Wort 18.09.2026: "wir machen die festen werte").
// Note 1 bis 9, 9.5 und 10 - ganze Stufen plus die beiden oberen halben. Firmen: die
// gaengigen; eine Notiz mit einem Wert ausserhalb der Liste zeigt ihn weiter (er wird als
// eigene Option vorangestellt), damit nichts verschwindet.
const GRADINGS = ["PSA", "BGS", "CGC", "SGC", "ACE", "AP", "TAG"];
const NOTEN = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "9.5", "10"];
// Auswahlfeld in Exemplar-Zeilen: bekannte Liste plus den Wert der Notiz, falls fremd.
const wahlKlein = (name, wertJetzt, liste, i, extra = "") => {
  const w = wertJetzt == null || wertJetzt === "" ? "" : String(wertJetzt);
  const alle = w && !liste.includes(w) ? [w, ...liste] : liste;
  return `<select class="ks-feld ks-feld--klein" data-feld="${name}" data-pfad="${pfad}" data-nr="${i}"${extra}>
          <option value="">–</option>
          ${alle.map((o) => `<option value="${esc(o)}"${w === o ? " selected" : ""}>${esc(o)}</option>`).join("")}
        </select>`;
};
const SPRACHEN = window.ksSprachen;   // eine Quelle: rahmen.js (18.09.2026)
const pfad = esc(p.file.path);
// OHNE AUFRUFER, und sie bleibt stehen (Loeschverbot) - aber sie setzte ihren Wert bis
// 19.09.2026 als einzige Stelle des Vaults ohne esc() in ein value="..." (Durchgang 20,
// Befund 6). Heute rendert sie nichts; sie waere ein Loch in dem Moment, in dem jemand sie
// wieder anschliesst, denn sie sieht aus wie ihre sichere Schwester feldText. esc() auf
// einer Zahl kostet nichts und nimmt der Funktion die Falle.
const feldZahl = (label, name, wertJetzt, einheit, hinweis, nr) =>
  `<div class="ks-karte__kachel ks-karte__kachel--eingabe"><div class="ks-karte__label">${label}</div>
   <div class="ks-karte__feldzeile"><input class="ks-feld" type="text" inputmode="decimal" value="${esc(wertJetzt ?? "")}"
     placeholder="–" data-feld="${name}" data-art="zahl" data-pfad="${pfad}"${nr === undefined ? "" : ` data-nr="${nr}"`}><span>${einheit}</span></div>
   ${hinweis ? `<div class="ks-karte__detail">${hinweis}</div>` : ""}</div>`;
const feldWahl = (label, name, wertJetzt, liste, hinweis, nr) =>
  `<div class="ks-karte__kachel ks-karte__kachel--eingabe"><div class="ks-karte__label">${label}</div>
   <select class="ks-feld" data-feld="${name}" data-pfad="${pfad}"${nr === undefined ? "" : ` data-nr="${nr}"`} style="margin-top:8px">
     <option value="">–</option>
     ${liste.map(o => `<option value="${esc(o)}"${String(wertJetzt) === o ? " selected" : ""}>${esc(o)}</option>`).join("")}
   </select>${hinweis ? `<div class="ks-karte__detail">${hinweis}</div>` : ""}</div>`;

// Stift (18.09.2026): oeffnet ein gesetztes Feld wieder zur Eingabe. Nicht im Werbemodus -
// dort stuende der echte Wert im Eingabefeld (Fehlermuster 16a).
const stift = (name) => window.ksWerbemodus() ? "" : `<button type="button" class="ks-stift" data-stift="${name}" title="Ändern"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/><path d="M13.5 6.5l4 4"/></svg></button>`;
// Kachel, die Anzeige ist und per Stift zur Eingabe wird; leer ist sie gleich Eingabe.
const kachelStift = (label, name, wert, platzhalter, hinweis) => leer(wert)
  ? feldText(label, name, "", platzhalter, hinweis, undefined, "ks-feld--text")
  : `<div class="ks-karte__kachel"><div class="ks-karte__label">${label}${stift(name)}</div>
     <div class="ks-karte__zahl" data-stift-anzeige="${name}">${esc(wert)}</div>
     <div class="ks-karte__feldzeile" data-stift-ziel="${name}" hidden><input class="ks-feld ks-feld--text" type="text" value="${esc(wert)}"
       placeholder="${esc(platzhalter)}" data-feld="${name}" data-pfad="${pfad}"></div>
     ${hinweis ? `<div class="ks-karte__detail">${hinweis}</div>` : ""}</div>`;
const feldText = (label, name, wertJetzt, platzhalter, hinweis, nr, klasse = "") =>
  `<div class="ks-karte__kachel ks-karte__kachel--eingabe"><div class="ks-karte__label">${label}</div>
   <div class="ks-karte__feldzeile"><input class="ks-feld${klasse ? " " + klasse : ""}" type="text" value="${esc(wertJetzt ?? "")}"
     placeholder="${esc(platzhalter)}" data-feld="${name}" data-pfad="${pfad}"${nr === undefined ? "" : ` data-nr="${nr}"`}></div>
   ${hinweis ? `<div class="ks-karte__detail">${hinweis}</div>` : ""}</div>`;

const verkauft = alleVerkauft;

// Grading über alle Exemplare zusammenfassen - die Regel steht in window.ksGradText
// (rahmen.js), damit Album-Chip und Dashboard-Liste dieselbe Aussage treffen.
// Rueckgabe ist Rohtext, darum unten esc().
const gradierte = gezeigte.filter((e) => e.grading);
const gradText = window.ksGradText(gezeigte);
const gradDetail = (() => {
  if (!gradierte.length) return "raw";
  const zerts = gradierte.map((e) => window.ksZertifikat(e.zertifikat)).filter(Boolean);
  if (zerts.length === 1) return `Zertifikat ${esc(zerts[0])}`;
  const namen = [...new Set(gradierte.map((e) => grad(e.grading, e.note)))];
  return namen.length > 1 ? namen.join(" · ") : (zerts.length ? `${zerts.length} Zertifikate` : "");
})();

// Exemplare als Liste, im Stil der Dashboard-Zeilen - nur mit Feldern zum Setzen.
// Die Felder tragen data-nr, damit rahmen.js weiß, welches Exemplar es schreibt.
//
// Welches Feld nur unter einer Bedingung erscheint, steht in rahmen.js
// (window.ksAbhaengigeFelder) - dieselbe Liste, aus der der Schreibpfad die abhängigen
// Werte miträumt, wenn die Bedingung geleert wird. Bis 16.09.2026 stand die Bedingung
// hier und die Aufräumregel nirgends: Wer ein Verkaufsdatum löschte, behielt den alten
// Verkaufspreis unsichtbar in der Datei, und ein neues Datum holte ihn zurück.
const zeigt = (e, name) => window.ksFeldSichtbar(e, name);
const exemplarZeile = (e, i) => {
  const ist = !!e.verkauft;
  const eigen = e.wert_manuell != null ? e.wert_manuell : null;
  const zeilenWert = ist ? (e.verkaufspreis ?? null) : (eigen ?? preis);
  return `<div class="ks-stueck${ist ? " ks-stueck--verkauft" : ""}" data-verkauft="${ist ? "ja" : ""}" data-grading="${e.grading ? esc(e.grading) : "raw"}" data-note="${e.grading ? esc(e.note) : ""}" data-zustand="${esc(e.zustand)}">
    <span class="ks-stueck__nr">${i + 1}</span>
    <div class="ks-stueck__felder">
      <label class="ks-stueck__feld"><span>Zustand</span>
        <select class="ks-feld ks-feld--klein" data-feld="zustand" data-pfad="${pfad}" data-nr="${i}">
          <option value="">–</option>
          ${ZUSTAENDE.map(o => `<option value="${esc(o)}"${e.zustand === o ? " selected" : ""}>${esc(o)}</option>`).join("")}
        </select></label>
      <!-- "Eigener Wert" nur, wenn er gebraucht wird (Marks Wort 18.09.2026): bei Grading (Cardmarket
           kennt nur die rohe Karte), bei einer Karte ohne Marktpreis (sonst gaebe es keinen Weg zu
           einem Wert), und immer, wenn schon einer drinsteht - ein Wert, der unsichtbar rechnet,
           waere ein Fehler. -->
      ${(e.grading || preis == null || e.wert_manuell != null) ? `<label class="ks-stueck__feld"><span>Eigener Wert</span>
        <!-- esc() seit 19.09.2026 auch hier (Durchgang 20, Befund 6). Diese drei Zahlenfelder
             laufen zwar vorher durch window.ksZahl, das nur Zahl oder null liefert - aber eine
             Stelle, die nur deshalb sicher ist, weil weit weg jemand anders aufpasst, ist eine
             Wette. esc() auf einer Zahl kostet nichts, und danach sieht keine Einsetzung in
             einem Attribut mehr anders aus als die uebrigen. -->
        <input class="ks-feld ks-feld--klein" type="text" inputmode="decimal" value="${esc(e.wert_manuell ?? "")}"
          placeholder="–" data-feld="wert_manuell" data-art="zahl" data-pfad="${pfad}" data-nr="${i}"></label>` : ""}
      <label class="ks-stueck__feld"><span>Grading</span>
        ${wahlKlein("grading", e.grading, GRADINGS, i)}</label>
      ${zeigt(e, "note") ? `<label class="ks-stueck__feld ks-stueck__feld--schmal"><span>Note</span>
        ${wahlKlein("note", e.note, NOTEN, i, ' data-art="zahl"')}</label>` : ""}
      ${zeigt(e, "zertifikat") ? `<label class="ks-stueck__feld"><span>Zertifikat</span>
        <input class="ks-feld ks-feld--klein" type="text" value="${esc(window.ksZertifikat(e.zertifikat))}"
          placeholder="–" data-feld="zertifikat" data-pfad="${pfad}" data-nr="${i}"${window.ksWerbemodus() ? " readonly" : ""}></label>` : ""}
      <!-- Ein echtes Datumsfeld, kein freier Text (gemeldet 16.09.2026): Jeder Text darin
           nahm das Exemplar aus dem Bestand und senkte den Gesamtwert, denn alle Leser
           pruefen nur "nicht leer". Chromium 150 im Rahmen bringt den Kalender mit. -->
      <!-- Alles, was man einstellen kann, muss sich zuruecksetzen lassen (Marks Regel
           18.09.2026: "man kann sich ja auch verklicken"). Ein Datumsfeld hat keinen
           sichtbaren Rueckweg - darum der Knopf, der Datum und Verkaufspreis leert. -->
      <!-- Reihenfolge seit 18.09.2026: erst der Verkaufspreis (immer da), dann das Datum -
           es erscheint, sobald ein Preis steht. Traegt eine aeltere Notiz ein Datum ohne
           Preis, bleibt das Datum trotzdem sichtbar: Das Exemplar zaehlt als verkauft, und
           ein Zustand, den man nicht sieht, laesst sich nicht zuruecknehmen. -->
      <!-- Kaufpreis direkt vor dem Verkaufspreis (Marks Wort 18.09.2026: "Kaufpreis vor Verkauf") -
           gekauft und verkauft stehen nebeneinander, die Differenz rechts liest sich dazu. -->
      <label class="ks-stueck__feld"><span>Kaufpreis</span>
        <input class="ks-feld ks-feld--klein" type="text" inputmode="decimal" value="${esc(e.kaufpreis ?? "")}"
          placeholder="–" data-feld="kaufpreis" data-art="zahl" data-pfad="${pfad}" data-nr="${i}"></label>
      <!-- Preis und Datum stehen in EINER Klammer (Marks Wort 19.09.2026: "die beide bitte
           in eine kachel damit man weiss die gehoeren zusammen") - sie beschreiben denselben
           Vorgang, und das Datum erscheint ohnehin erst, wenn ein Preis dasteht. Der
           Ruecknahme-Knopf gehoert dazu: er leert beide. -->
      <div class="ks-stueck__paar">
        <label class="ks-stueck__feld"><span>Verkaufspreis</span>
          <input class="ks-feld ks-feld--klein" type="text" inputmode="decimal" value="${esc(e.verkaufspreis ?? "")}"
            placeholder="–" data-feld="verkaufspreis" data-art="zahl" data-pfad="${pfad}" data-nr="${i}"></label>
        ${(zeigt(e, "verkauft") || ist) ? `<label class="ks-stueck__feld"><span>Verkauft am</span>
          <input class="ks-feld ks-feld--klein" type="date" value="${esc(iso(e.verkauft))}"
            data-feld="verkauft" data-art="datum" data-pfad="${pfad}" data-nr="${i}">
          ${datumRoh(e.verkauft) ? `<span class="ks-stueck__hinweis">„${esc(datumRoh(e.verkauft))}" ist kein Datum</span>` : ""}</label>` : ""}
        ${ist ? `<button type="button" class="ks-knopf ks-knopf--leise ks-stueck__zurueck" data-leeren="verkaufspreis">Verkauf zurücknehmen</button>` : ""}
      </div>
    </div>
    <span class="ks-stueck__wert">${window.ksGeld(zeilenWert, zeilenWert != null, { roh: true, leer: "–" })}${deltaHtml(kaufDelta(e.kaufpreis, zeilenWert), "ks-stueck__delta")}${ist ? `<span class="ks-stueck__marke">verkauft</span>` : ""}</span>
    <!-- Beim LETZTEN Exemplar nimmt das Kreuz die ganze Karte aus der Sammlung (19.09.2026,
         Marks Frage "warum kann ich das letzte exemplar eigentlich nicht loeschen?"). Das
         Exemplar allein zu loeschen ginge nicht: Bei leerer Liste baut window.ksExemplare
         wieder eines aus den alten Feldern - die Zeile waere nur geleert, nicht weg. Was
         der Nutzer an dieser Stelle will, ist die Karte loszuwerden; nach Rueckfrage wird
         die Notiz geloescht (Marks Entscheidung 19.09.2026). -->
    ${exemplare.length > 1
      ? `<a class="ks-stueck__weg" href="#" data-exemplar="weg" data-nr="${i}" data-pfad="${pfad}" title="Exemplar entfernen">✕</a>`
      : `<a class="ks-stueck__weg" href="#" data-exemplar="karte-weg" data-nr="${i}" data-pfad="${pfad}" title="Karte aus der Sammlung nehmen">✕</a>`}
  </div>`;
};

// Filter ueber die Exemplar-Liste (Marks Wort 18.09.2026: "auch hier filter"), dieselben
// zwei Fragen wie im Album: Bestand/verkauft und gegradet/raw. Erst ab zwei Exemplaren -
// eines filtert man nicht. Die Wahl liegt in window.ksStueckFilter je Notiz, weil jede
// Feldaenderung die Ansicht neu baut und der Filter sonst bei jedem Tippen zurueckspraenge.
// Eigene Zeile unter dem Titel, nicht im Kopf (Marks Wort 18.09.2026: "da ist mehr platz
// und ich will mehr filter"). Zustand und Grading listen, was die Exemplare tragen -
// Grading mit Note ("PSA 10"), weil "PSA" allein nichts sagt; "raw" steht immer dabei.
// Feste Listen im Filter (Marks Wort): Zustand aus ZUSTAENDE, Grading-Firma aus GRADINGS
// plus raw, Note aus NOTEN. Werte, die eine Notiz ausserhalb der Listen traegt, kommen
// hinten dazu, damit jede Zeile filterbar bleibt.
const dazu = (liste, werte) => [...liste, ...werte.filter((w) => w && !liste.includes(w))];
const zustaendeAlle = dazu(ZUSTAENDE, exemplare.map((e) => String(e.zustand ?? "")));
const gradingsAlle = dazu(GRADINGS, exemplare.map((e) => String(e.grading ?? "")));
const notenAlle = dazu(NOTEN, exemplare.filter((e) => e.grading).map((e) => String(e.note ?? "")));
const opt = (liste) => liste.map((x) => `<option value="${esc(x)}">${esc(x)}</option>`).join("");
const stueckFilter = exemplare.length < 2 ? "" : `<div class="ks-stueck-filter">
    <select class="ks-stueck-filter__wahl" data-stueckfilter="verkauft">
      <option value="">Bestand und verkauft</option><option value="nein">Bestand</option><option value="ja">nur verkauft</option></select>
    <select class="ks-stueck-filter__wahl" data-stueckfilter="zustand">
      <option value="">Alle Zustände</option>${opt(zustaendeAlle)}</select>
    <select class="ks-stueck-filter__wahl" data-stueckfilter="grading">
      <option value="">Gegradet und raw</option><option value="raw">raw</option>${opt(gradingsAlle)}</select>
    <select class="ks-stueck-filter__wahl" data-stueckfilter="note">
      <option value="">Alle Noten</option>${opt(notenAlle)}</select>
    <span class="ks-stueck-filter__zahl"></span></div>`;
const exemplarListe = `<div class="ks-flaeche">
  <div class="ks-flaeche__kopf"><span class="ks-flaeche__titel">${exemplare.length === 1 ? "Exemplar" : `${exemplare.length} Exemplare`}</span>
    <a class="ks-knopf ks-knopf--leise" href="#" data-exemplar="dazu" data-pfad="${pfad}">Exemplar hinzufügen</a></div>
  ${stueckFilter}
  ${exemplare.map(exemplarZeile).join("")}
</div>`;

// Fotos
const fotos = leer(p.foto) ? [] : (Array.isArray(p.foto) ? p.foto : [p.foto]).map(String);
// Nummer nur, wenn es mehrere sind - sonst hing am Knopf ein "Foto " mit Leerzeichen
const fotoLinks = fotos.map((f, i) => `<a class="ks-knopf ks-knopf--leise" href="#" data-ziel="${esc(f)}">${fotos.length > 1 ? `Foto ${i + 1}` : "Foto"}</a>`).join(" ");

const html = `<div class="ks-seite">
  ${window.ksNaviHtml("Album.md")}
  <div class="ks-seite__inhalt">
    <div class="ks-kopf"><div>
      <!-- Kein Grading mehr im Kopf (Marks Wort 18.09.2026: "brauchen wir da oben nicht") -
           es steht je Exemplar in der Liste; der Album-Chip fasst weiter zusammen. -->
      <div class="ks-kopf__label">${esc(window.ksSetName(p)) || "Set fehlt"} · ${esc(p.nummer) || "Nummer fehlt"}${leer(p.set) || leer(p.nummer) ? "" : stift("setnummer")}</div>
      <h1 class="ks-kopf__titel">${esc(window.ksKartenName(p) ?? p.file.name)}${verkauft ? ` <span class="ks-karte__marke ks-karte__marke--verkauft">verkauft</span>` : ""}</h1>
      ${leer(window.ksOriginalName(p)) ? "" : `<div class="ks-kopf__label" style="text-transform:none;letter-spacing:0;font-size:14px;color:var(--leise)">${esc(window.ksOriginalName(p))}</div>`}
    </div></div>

    <div class="ks-karte__oben">
      <div class="ks-karte__bento">
        <div class="ks-karte__anzeige">
          ${kachel("Wert", window.ksGeld(wert, wert != null, { leer: "–", ab: w.ohnePreis > 0 }),
                   anzahl === 0 ? "alle Exemplare verkauft"
                     : !w.hatWert ? "für diese Karte gibt es noch keinen Preis"
                     : wertSatz(anzahl), "ks-karte__kachel--akzent")}
          ${kaufKachel}
          ${cmKachel}
          <!-- Grading steht nicht mehr hier, sondern je Exemplar in der Liste darunter
               (Auftrag A1, 15.09.2026): ein Exemplar kann PSA 10 sein, das naechste
               roh. Seltenheit, Kennung und Sprache gelten für alle Exemplare und bleiben. -->
          <!-- Ohne Claude (18.09.2026): Was Claude sonst fuellt, muss sich hier eintragen
               lassen - aber nur, solange es leer ist. Sobald ein Wert steht, ist die Kachel
               wieder Anzeige, wie bei der Sprache: Eine Seltenheit oder Nummer, die von der
               Kennung kommt, soll niemand versehentlich umschreiben. Die Platzhalter nennen
               keinen echten Set-Namen: Diese Felder stehen auch im Werbemodus, und ein
               Platzhalter ist ein Kanal (Fehlermuster 16a). -->
          <div class="ks-karte__reihe">
            ${kachelStift("Seltenheit", "seltenheit", p.seltenheit, "z. B. Ultra Selten", "")}
            ${kachel("Kennung", leer(window.ksKennung(p)) ? `<span class="ks-karte__leer">fehlt</span>` : esc(window.ksKennung(p)),
                     leer(p.tcgdex) && !window.ksWerbemodus()
                       ? `${window.ksKennungQuelle()}<div class="ks-karte__fuss" style="justify-content:flex-start">${window.ksNeuKnopfHtml("Bei TCGdex suchen")}</div>`
                       : window.ksKennungQuelle())}
            <!-- Sprache ist ANZEIGE, sobald sie einmal gesetzt ist - kein Auswahlfeld mehr
                 (gemeldet 16.09.2026). Grund: Jede Sprache ist eine eigene Notiz mit eigener
                 Kennung, eigenem Preis und eigenem Bild. Wer hier die Sprache umstellt, hätte
                 eine deutsche Kennung mit englischem Etikett - die Karte würde sich selbst
                 widersprechen. Wer eine andere Ausgabe besitzt, legt eine eigene Notiz an.
                 Solange das Feld leer ist, bleibt die Auswahl: dann wird sie erstmals gesetzt. -->
            ${leer(p.sprache)
              ? `<div class="ks-karte__kachel ks-karte__kachel--eingabe"><div class="ks-karte__label">Sprache</div>
                  <select class="ks-feld" data-feld="sprache" data-pfad="${pfad}" style="margin-top:8px">
                    <option value="">–</option>
                    ${SPRACHEN.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}
                  </select></div>`
              : kachel("Sprache", esc(p.sprache), "")}
          </div>
          <!-- Set und Nummer: sichtbar, sobald eines fehlt; sonst versteckt und ueber den Stift
               im Kopf zu oeffnen (18.09.2026). Im Werbemodus nur, wenn eines fehlt - der echte
               Set-Name gehoert in kein Eingabefeld auf einem Werbebild. -->
          <div class="ks-karte__reihe" data-stift-ziel="setnummer"${leer(p.set) || leer(p.nummer) ? "" : " hidden"}>
            ${feldText("Set", "set", window.ksWerbemodus() ? "" : p.set, "Name des Sets", "", undefined, "ks-feld--text")}
            ${feldText("Nummer", "nummer", p.nummer, "Nummer/Set-Größe", "Mit der Set-Größe hinter dem Schrägstrich - daraus rechnet die Set-Seite", undefined, "ks-feld--text")}
          </div>
          ${leer(p.tcgdex) ? window.ksNeuHtml({ modus: "verknuepfen", pfad: p.file.path,
              vor: { name: p.name ?? p.file.name, nummer: p.nummer, set: p.set, sprache: p.sprache } }) : ""}
          ${leer(window.ksNotiz(p)) && !fotos.length ? "" : `<div class="ks-karte__kachel"><div class="ks-karte__label">Notiz</div>
            <div class="ks-karte__zahl"><span class="ks-karte__text">${esc(window.ksNotiz(p)) || ""}</span></div>
            ${fotos.length ? `<div class="ks-karte__fuss" style="justify-content:flex-start">${fotoLinks}</div>` : ""}</div>`}
          ${exemplarListe}
        </div>
      </div>

      <!-- Der Satz nennt eine Bedingung - also haengt er an derselben Bedingung
           (Fehlermuster 20, gemeldet Durchgang 17 Befund 5): "Es kommt automatisch,
           sobald die Karte eine Kennung hat" stand bis 18.09.2026 auch an Karten, die
           eine Kennung HABEN. Fuer die Grundset-Karten hat TCGdex kein Bild - die warten
           dann ewig auf eines, das nie kommt. Der dritte Fall (Werbemodus ohne eigene
           Bilder) kommt weiter aus window.ksBildLeerText. -->
      <div class="ks-karte__bildbahn">
        ${src ? `<div class="ks-karte__bildbox"><img class="ks-karte__bild" src="${esc(src)}" alt="${esc(window.ksKartenName(p) ?? p.file.name)}"><div class="ks-karte__glanz"></div></div>`
              : `<div class="ks-karte__bild ks-karte__bild--leer">${window.ksBildLeerText()
                    ? esc(window.ksBildLeerText())
                    : leer(p.tcgdex)
                    ? "Noch kein Bild.<br>Es kommt automatisch, sobald die Karte eine Kennung hat - oder du legst ein eigenes Foto ab."
                    : "Noch kein Bild.<br>Diese Karte hat eine Kennung, aber TCGdex führt kein Bild dazu - lege ein eigenes Foto ab."}</div>`}
      </div>
    </div>
  </div>
</div>`;

window.ksRahmen(dv, {
  karte: p,   // für die Titel-Ersetzung im Werbemodus (Tab, Kopfzeile, Fenstertitel)
  html,
  hoehe: "calc(100vh - 144px)",
  fertig: (dok) => {
    // Exemplar-Filter: im DOM ausblenden (hidden), Wahl je Notiz merken und beim Neuaufbau
    // zurueckholen. Steht VOR dem Kipp-Effekt, der bei Karten ohne Bild frueh aussteigt.
    const filterKopf = dok.querySelector(".ks-stueck-filter");
    if (filterKopf) {
      window.ksStueckFilter = window.ksStueckFilter || {};
      const gemerkt = window.ksStueckFilter[p.file.path] || {};
      const zeilen = [...dok.querySelectorAll(".ks-stueck")];
      const zahl = filterKopf.querySelector(".ks-stueck-filter__zahl");
      const anwenden = () => {
        const wert = (n) => filterKopf.querySelector(`[data-stueckfilter="${n}"]`)?.value || "";
        const verkauft = wert("verkauft"), zustand = wert("zustand"), grading = wert("grading"), note = wert("note");
        window.ksStueckFilter[p.file.path] = { verkauft, zustand, grading, note };
        let sichtbar = 0;
        for (const z of zeilen) {
          const passt = (verkauft === "" || (verkauft === "ja") === (z.dataset.verkauft === "ja"))
            && (zustand === "" || z.dataset.zustand === zustand)
            && (grading === "" || z.dataset.grading === grading)
            && (note === "" || z.dataset.note === note);
          z.hidden = !passt;
          if (passt) sichtbar++;
        }
        zahl.textContent = sichtbar === zeilen.length ? "" : `${sichtbar} von ${zeilen.length}`;
      };
      for (const sel of filterKopf.querySelectorAll("[data-stueckfilter]")) {
        if (gemerkt[sel.dataset.stueckfilter] !== undefined) sel.value = gemerkt[sel.dataset.stueckfilter];
        sel.addEventListener("change", anwenden);
      }
      anwenden();
    }

    // Kipp-Effekt mit Glanz - von außen angehängt (Skripte im Rahmen würden auch laufen,
    // gemessen 15.09.2026; von außen ist es nur bequemer: eine Datei statt String im String)
    const r3 = dok.querySelector(".ks-karte__bildbox");
    if (!r3) return;
    const glanz = r3.querySelector(".ks-karte__glanz");
    r3.addEventListener("mousemove", (e) => {
      const r = r3.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      r3.style.transform = `perspective(1100px) rotateY(${(-(px - .5) * 22).toFixed(2)}deg) rotateX(${((py - .5) * 22).toFixed(2)}deg) scale(1.08)`;
      glanz.style.background = `radial-gradient(circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, rgba(255,255,255,.55) 0%, rgba(255,255,255,.18) 28%, rgba(255,255,255,0) 62%)`;
    });
    r3.addEventListener("mouseleave", () => { r3.style.transform = ""; glanz.style.background = ""; });

    // Klick aufs Bild zeigt es gross - über das ganze Obsidian-Fenster, nicht nur über
    // den Rahmen: der ist nur 88vh hoch, dort wäre ein hochformatiges Kartenbild kaum
    // größer als ohnehin (gemessen 508 statt 447 px). Darum liegt die Lupe im Hauptfenster.
    // Sie wird beim Öffnen erzeugt und beim Schliessen entfernt, damit nichts liegen bleibt.
    const bild = r3.querySelector(".ks-karte__bild");
    if (!bild) return;
    r3.addEventListener("click", () => {
      if (document.querySelector(".ks-lupe")) return;   // nur eine auf einmal
      const lupe = document.createElement("div");
      lupe.className = "ks-lupe";
      lupe.setAttribute("style", "position:fixed;inset:0;z-index:9999;display:flex;" +
        "align-items:center;justify-content:center;padding:24px;cursor:zoom-out;" +
        "background:rgba(10,10,10,.9);backdrop-filter:blur(4px)");
      const gross = document.createElement("img");
      gross.src = bild.src;
      gross.alt = bild.getAttribute("alt") || "";
      gross.setAttribute("style", "max-width:100%;max-height:100%;width:auto;border-radius:18px;" +
        "box-shadow:0 24px 70px rgba(0,0,0,.7);animation:ks-lupe-auf .18s ease-out");
      lupe.appendChild(gross);

      const zu = () => { lupe.remove(); document.removeEventListener("keydown", aufTaste); };
      const aufTaste = (e) => { if (e.key === "Escape") zu(); };
      lupe.addEventListener("click", zu);
      document.addEventListener("keydown", aufTaste);
      document.body.appendChild(lupe);
    });
  },
});
