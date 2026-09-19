// Gemeinsamer Rahmen für alle Oberflaechen (15.09.2026).
//
// DIE FASSUNG DES BINDERTRESORS - hier und nur hier (19.09.2026). Ohne eigene App gibt es
// keinen anderen Weg zu sagen, welchen Stand ein Kaeufer hat: Er sieht sie unten in der
// Navigation, und die Hilfe kann danach fragen. Wer die Technik aendert, zaehlt sie hoch -
// die 18 Dateien der Technik gehen als Paket hinaus, die Sammlung des Kaeufers (Karten/,
// Fotos/, Inbox/, Wertverlauf.csv) bleibt davon unberuehrt.
// Hier stand bis 19.09.2026 "17 Dateien", waehrend CLAUDE.md Punkt "Sieben Seiten, 18
// Dateien" sagte - zwei Zahlen fuer dasselbe Paket (Durchgang 21, Befund N3). Gemessen
// 19.09.2026: `ls Skripte/ | wc -l` -> 11 plus die 7 Seiten-Notizen = 18. ACHTUNG, es
// gibt eine ZWEITE, weitere Zaehlweise, und sie ist ebenfalls richtig: CLAUDE.md zaehlt
// unter "Die Technik dieses Vaults" zusaetzlich .obsidian/snippets/dashboard.css und
// Vorlagen/Karte.md mit und kommt damit auf 20. Massgeblich fuer die Fassungsnummer sind
// die 18; wer eine Datei ergaenzt, zieht BEIDE Stellen nach.
// Zaehlweise: erste Stelle = Umbau, der eine Anleitung braucht; zweite = neue Funktionen;
// dritte = Korrekturen.
//
// ZWEI SCHREIBWEISEN, EINE ZAHL (Marks Sorge 19.09.2026: "nicht dass irgendein verdrehter
// rechtsanwalt der meinung ist ich verkaufe eine app"). Verkauft wird ein LEITFADEN mit
// einer Vorlage, keine Software - und "1.0.0" klingt nach Software. Darum steht in der
// Oberflaeche "Ausgabe 1.0", wie bei einem Buch; die volle Nummer bleibt fuer den Git-Tag
// und fuer Support-Fragen. Wer die Zahl aendert, aendert sie hier.
window.ksVersion = "1.1";
// Die Fassung hat ZWEI Stellen, nicht drei (19.09.2026, Marks Wort „hast dus wieder
// ueberkompliziert gemacht"). Vorbei sind damit beide Sonderregeln: Hier stand erst eine,
// die die dritte Stelle immer abschnitt - dann standen auf der Ueber-Seite „Ausgabe 1.0"
// und „1.0.1" nebeneinander. Danach eine, die sie nur bei einer Null wegliess. Beide
// kauften nichts: Ein Leitfaden hat Auflagen wie ein Buch, keine Patch-Level wie Software.
// Aus 1.0.0 wird 1.0, aus 1.0.1 wird 1.1. Eine Zahl, eine Quelle, ueberall dasselbe.
window.ksAusgabe = () => "Ausgabe " + window.ksVersion;

// ---- Aktualisieren (19.09.2026, Marks Entscheidung: melden UND auf Knopfdruck holen) ------
//
// Der Vault schaut nach, ob es eine neuere Ausgabe gibt, und holt sie auf Knopfdruck. Vier
// Dinge machen den Unterschied zwischen einem Leitfaden mit Vorlage und einer Software, die
// sich selbst aktualisiert - sie sind hier eingebaut und duerfen nicht wegfallen:
//
//   1. Der Kaeufer loest es aus. Kein Abruf im Hintergrund, kein automatisches Schreiben.
//   2. Ohne Netz laeuft alles weiter. Jeder Fehler hier ist STILL: Es gibt keine Meldung,
//      keinen roten Kasten, nichts Kaputtes - nur keinen Hinweis. Was verkauft wurde, muss
//      auch dann laufen, wenn es diesen Server eines Tages nicht mehr gibt.
//   3. Es wird nichts gesendet. Kein Vault-Name, keine Kartenzahl, nicht einmal die eigene
//      Fassungsnummer. Der Server sieht eine IP in seinem Log, mehr nicht - genau das steht
//      auf der Ueber-Seite und in der Datenschutzerklaerung.
//   4. Vor dem Schreiben wird gesichert. Die alte Fassung bleibt vollstaendig liegen.
//
// Die Adresse steht an genau einer Stelle. Wer sie aendert, aendert sie hier.
//
// Der Buchstabensalat im Pfad ist Absicht (19.09.2026, Marks Wunsch). Er ist KEIN Schutz -
// er steht in jedem verkauften Vault im Klartext, und wer ihn einmal hat, hat ihn. Er
// verhindert nur, dass jemand beim Stoebern darueber stolpert: Die Wurzel der Adresse
// antwortet mit 404, und im oeffentlichen Verzeichnis steht der Pfad nirgends.
//
// Echten Schutz gibt es hier nicht und kann es nicht geben: Der Vault kann sich nirgends
// anmelden, jeder Schluessel laege im Klartext in einer Datei, die jeder Kaeufer hat.
// Der Schutz des Produkts ist der Leitfaden, nicht der Code - ohne ihn weiss niemand,
// wie man daraus einen Vault macht.
window.ksAusgabeQuelle = "https://updates.bindertresor.de/a8vam9ur2bbt/";

// Holt eine Adresse von bindertresor.de. NICHT mit fetch (19.09.2026, gemessen): Obsidian
// laeuft unter der Herkunft "app://obsidian.md", und der Server schickt keinen
// Access-Control-Allow-Origin-Kopf - fetch scheitert dort mit "Failed to fetch", noch bevor
// eine Zeile ankommt. TCGdex geht mit fetch, weil es "*" schickt; ein gewoehnliches
// Webhosting-Paket tut das nicht.
//
// `requestUrl` ist Obsidians eigener Abruf. Er laeuft nicht im Browserteil und kennt darum
// keine Herkunftssperre. Der Rueckfall auf fetch bleibt stehen fuer den Fall, dass dieses
// Skript einmal ausserhalb von Obsidian laeuft (etwa in einem Selbsttest).
//
// Zeitschranke von Hand: `requestUrl` bringt keine mit, und ohne sie haengt der Knopf bei
// totem Netz fuer immer.
const ksAusgabeAbruf = async (url, sekunden = 8) => {
  const lauf = (async () => {
    if (typeof requestUrl === "function") {
      const r = await requestUrl({ url, method: "GET", throw: false });
      if (r.status < 200 || r.status > 299) throw new Error(`Antwort ${r.status}`);
      return r.text;
    }
    const r = await fetch(url, { cache: "no-store", referrerPolicy: "no-referrer" });
    if (!r.ok) throw new Error(`Antwort ${r.status}`);
    return await r.text();
  })();
  let wecker;
  const frist = new Promise((_, weg) => { wecker = setTimeout(() => weg(new Error("Zeit abgelaufen")), sekunden * 1000); });
  try { return await Promise.race([lauf, frist]); } finally { clearTimeout(wecker); }
};

// Vergleicht zwei Ausgabenummern der Groesse nach, nicht als Text. Als Text waere
// "1.9" groesser als "1.10" - der Kaeufer bekaeme das Update nie.
window.ksAusgabeNeuer = (dort, hier) => {
  const z = (s) => String(s ?? "").split(".").map((x) => parseInt(x, 10) || 0);
  const a = z(dort), b = z(hier);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d) return d > 0;
  }
  return false;
};

// Welche Dateinamen aus der Serverantwort ueberhaupt geschrieben werden duerfen.
// OHNE DIESE PRUEFUNG waere die Datei auf dem Server ein Schreibrecht auf den ganzen Vault:
// ein Name wie "../Karten/Glurak.md" oder "/etc/hosts" landete sonst genau dort. Erlaubt ist
// ein schlichter Dateiname mit einer der drei Endungen, die der Ordner "Skripte" kennt -
// kein Schraegstrich, kein Doppelpunkt, keine zwei Punkte hintereinander.
window.ksAusgabeDateiOk = (name) =>
  typeof name === "string" &&
  /^[A-Za-z0-9][A-Za-z0-9._-]*\.(js|css|py)$/.test(name) &&
  !name.includes("..");

// Holt die Beschreibung der neuesten Ausgabe. Gibt `null` zurueck, wenn irgendetwas nicht
// stimmt - kein Netz, kein Server, kaputte Antwort, unbrauchbare Dateiliste. Der Aufrufer
// zeigt dann einfach nichts an.
window.ksAusgabePruefen = async () => {
  try {
    const roh = await ksAusgabeAbruf(window.ksAusgabeQuelle + "ausgabe.json");
    const d = JSON.parse(roh);
    if (!d || typeof d.ausgabe !== "string") return null;
    const dateien = Array.isArray(d.dateien) ? d.dateien.filter(window.ksAusgabeDateiOk) : [];
    if (!dateien.length) return null;
    return {
      ausgabe: d.ausgabe,
      datum: typeof d.datum === "string" ? d.datum : "",
      neu: Array.isArray(d.neu) ? d.neu.filter((x) => typeof x === "string").slice(0, 8) : [],
      dateien,
      neuer: window.ksAusgabeNeuer(d.ausgabe, window.ksVersion),
    };
  } catch (e) { return null; }
};

// Holt die Dateien und schreibt sie. `melde(text)` bekommt jeden Schritt fuer die Anzeige.
// Reihenfolge mit Absicht: ERST alles holen, DANN sichern, DANN schreiben. Wer beim Holen
// abbricht - halbes Netz, Server weg -, hat noch nichts angefasst.
window.ksAusgabeHolen = async (stand, melde = () => {}) => {
  const basis = window.ksAusgabeQuelle;
  const geholt = [];

  for (const name of stand.dateien) {
    if (!window.ksAusgabeDateiOk(name)) throw new Error(`Unerlaubter Dateiname: ${name}`);
    melde(`Hole ${name} …`);
    // 30 Sekunden je Datei: rahmen.js ist ueber 100 KB, und acht Sekunden sind auf einer
    // langsamen Verbindung knapp.
    const text = await ksAusgabeAbruf(basis + encodeURIComponent(name), 30);
    // Eine leere Antwort ueberschreibt sonst eine funktionierende Datei mit nichts.
    if (!text.trim()) throw new Error(`${name} kam leer an`);
    geholt.push([name, text]);
  }

  // Sicherung: die ALTE Fassung vollstaendig, unter ihrer eigenen Nummer. Sie wird nie
  // wieder angefasst - im Haus wird nichts geloescht, und wer zurueck will, kopiert zurueck.
  const ordner = `Skripte/_vorher-${window.ksVersion}`;
  melde(`Sichere die bisherige Ausgabe nach ${ordner} …`);
  const ad = app.vault.adapter;
  if (!(await ad.exists(ordner))) await ad.mkdir(ordner);
  for (const [name] of geholt) {
    const quelle = `Skripte/${name}`;
    if (await ad.exists(quelle)) await ad.write(`${ordner}/${name}`, await ad.read(quelle));
  }

  for (const [name, text] of geholt) {
    melde(`Schreibe ${name} …`);
    await ad.write(`Skripte/${name}`, text);
  }

  return { anzahl: geholt.length, sicherung: ordner };
};
//
// Warum: Obsidians Leseansicht ist virtualisiert und springt beim Scrollen, die Live-Vorschau
// bringt CodeMirror mit. In einem <iframe> gilt beides nicht – dort ist ein normaler Browser.
// Im Rahmen läuft KEIN Skript (Obsidians Sicherheitsrichtlinie blockt das); der Rahmen ist
// gleichen Ursprungs, darum hängt dieses Skript die Ereignisse von außen an.
//
// Aufruf aus einem Seiten-Skript:
//   await dv.view("Skripte/rahmen");
//   window.ksRahmen(dv, { html, hoehe: "calc(100vh - 144px)", befehl, nachAenderung, fertig });
//
// Die Höhe ist so gewaehlt, dass Obsidian außen NICHTS mehr zu scrollen hat: bei 88vh
// blieben 35 px übrig, und man hatte zwei Scrollbahnen uebereinander (gemeldet
// 15.09.2026). Die 144 px sind gemessen: Obsidians Kopfzeile plus der Ueberschuss unter
// dem Block. Geprueft bei Fensterhoehe 700, 891 und 1000 - außen jeweils 0 Scrollweg.
//
// Was der Rahmen von außen bedient:
//   a[data-ziel]        -> öffnet eine Notiz oder Datei im Vault
//   a[data-ordner]      -> öffnet einen Ordner im Finder
//   [data-befehl]       -> führt einen benannten Befehl aus (siehe unten)
//   input/select[data-feld][data-pfad] -> schreibt den Wert ins Frontmatter der Notiz

// Exemplare einer Karte. Ein Sammler kann dieselbe Karte mehrfach besitzen, mit
// unterschiedlichem Zustand, Kaufpreis, Grading oder schon verkauft (Anforderung
// 15.09.2026). Darum steht im Frontmatter eine Liste `exemplare` statt einer `anzahl`.
//
// Rueckwaerts vertraeglich: Fehlt die Liste, wird sie aus den alten Feldern gebaut -
// `anzahl: 2` mit `zustand: NM` ergibt zwei Exemplare mit diesem Zustand. So laufen
// alte Notizen weiter, und wer neu anfaengt, merkt vom Uebergang nichts.
// DIE EINE Lesart einer Zahl aus dem Kopfblock - Gegenstueck zu `zahl()` in preise.py,
// Zeile fuer Zeile dieselbe Regel: leer und UNLESBAR sind `null`, alles andere eine Zahl.
// Bis 18.09.2026 hiess dasselbe Wort drei Verschiedenes (gemeldet Durchgang 17, Befund 2):
// hier NaN (`Number("164-190")`), in preise.py None, in den damals sechs Seiten 0 (heute
// sind es sieben; das Wort "sechs" ist hier ein Datum, keine Angabe ueber den Stand -
// klargestellt 19.09.2026, Durchgang 21, Befund N3). NaN war der
// teuerste der drei: Ein einziges unlesbares Feld machte die Summe der GANZEN Sammlung
// zu NaN, window.ksGeld ersetzte sie lautlos durch "noch kein Preis", und `ohnePreis`
// merkte nichts davon (`NaN == null` ist falsch) - die Kurve zeigte daneben weiter
// 10.626 €. Die 0 war die dritte Lesart und behauptete "0,00 €", genau die Falle, gegen
// die Durchgang 14 bis 16 gebaut haben. Wer die Regel aendert, aendert beide Stellen.
window.ksZahl = (v) => {
  if (typeof v === "number") return isFinite(v) ? v : null;
  if (v === "" || v == null || typeof v === "boolean" || Array.isArray(v)) return null;
  const n = Number(v);
  return isFinite(n) ? n : null;
};
// "N verschiedene" - DIE EINE Schreibweise fuer eine Menge NOTIZEN (Marks Wortregelung
// 18.09.2026: "Karte" allein heisst Exemplar, wo Notizen gemeint sind, steht
// "verschiedene"). Sie steht hier und nicht in fuenf Seiten, weil genau so eine
// Beschriftung bisher jedes Mal wieder auseinanderlief (Fehlermuster 18) - und weil sie
// den Singular braucht: "1 verschiedene" ist kein Deutsch.
// (Hier stand bis 19.09.2026 weiter: ', "1 verschiedene Karte" schon.' - der Satz
//  stimmt sprachlich und ist trotzdem der Fehler, siehe gleich darunter.)
//
// 19.09.2026 (Durchgang 21, Befund N6): Der Einzahlfall lieferte bis heute
// "1 verschiedene Karte" - und brach damit genau die Regel, fuer die es diese Funktion
// gibt. "Karte" heisst seit Marks Entscheidung vom 18.09.2026 EXEMPLAR; hier steht aber
// eine Notizenzahl. Ein Vault mit EINER Notiz und DREI Exemplaren zeigte auf der
// Start-Seite untereinander "3 Karten da" und "1 verschiedene Karte mit Preis" - dasselbe
// Wort fuer zwei Mengen auf einem Bildschirm, also der Befund, gegen den die Start-Seite
// ueberhaupt gebaut wurde. Genau die Lage des Anfaengers mit seiner ersten Karte.
// Das Ersatzwort ist nicht erfunden: CLAUDE.md schreibt die Regel selbst als
// "Wo Notizen gemeint sind (verschiedene MOTIVE, unabhaengig davon, wie oft man sie
// besitzt), steht 'verschiedene' dabei". Die Mehrzahl bleibt unveraendert - sie ist
// gemessen und von Mark abgenommen ("63 verschiedene mit Preis").
window.ksVerschieden = (n) => n === 1 ? "1 verschiedenes Motiv" : `${n} verschiedene`;

window.ksExemplare = (k) => {
  const zahl = window.ksZahl;
  const roh = k?.exemplare;
  if (Array.isArray(roh) && roh.length) {
    return roh.map((e) => ({
      zustand: e?.zustand ?? "", kaufpreis: zahl(e?.kaufpreis),
      grading: e?.grading ?? "", note: e?.note ?? "", zertifikat: e?.zertifikat ?? "",
      verkauft: e?.verkauft ?? "", verkaufspreis: zahl(e?.verkaufspreis),
      wert_manuell: zahl(e?.wert_manuell), foto: e?.foto ?? "",
    }));
  }
  // aus den alten Feldern: die Angaben galten für alle Exemplare gemeinsam
  const n = Math.max(1, Math.round(Number(k?.anzahl) || 1));
  const eines = {
    zustand: k?.zustand ?? "", kaufpreis: zahl(k?.kaufpreis),
    grading: k?.grading ?? "", note: k?.note ?? "", zertifikat: k?.zertifikat ?? "",
    verkauft: k?.verkauft ?? "", verkaufspreis: zahl(k?.verkaufspreis),
    wert_manuell: zahl(k?.wert_manuell), foto: "",
  };
  return Array.from({ length: n }, () => ({ ...eines }));
};

// Felder eines Exemplars, die es nur gibt, solange ihre Bedingung gefuellt ist:
// Note und Zertifikat nur bei gesetztem Grading, der Verkaufspreis nur bei gesetztem
// Verkaufsdatum. DIE EINZIGE Stelle dieser Zuordnung - seite-karte.js entscheidet
// daraus, was angezeigt wird (window.ksFeldSichtbar), und der change-Handler weiter
// unten raeumt daraus mit, wenn eine Bedingung geleert wird. Wer ein Feld ergaenzt,
// ergaenzt es hier, nicht an zwei Stellen (Fehlermuster 11).
// Seit 18.09.2026 haengt das DATUM am Preis, nicht umgekehrt (Marks Wort: "verkauft datum
// kommt erst rein wenn ein verkaufspreis eingegeben wurde"): Wer den Verkaufspreis leert,
// leert das Datum mit. Als verkauft zaehlt weiterhin das Datum (ksWert, Filter, preise.py).
window.ksAbhaengigeFelder = { grading: ["note", "zertifikat"], verkaufspreis: ["verkauft"] };
window.ksFeldSichtbar = (e, name) => {
  for (const [bedingung, abhaengige] of Object.entries(window.ksAbhaengigeFelder)) {
    if (abhaengige.includes(name)) return !!e?.[bedingung];
  }
  return true;
};

// Was eine Karte wert ist: je Exemplar der eigene manuelle Wert, sonst der Kartenpreis.
// Verkaufte zählen nicht mehr zum Bestand.
//
// DIE EINZIGE Stelle der Wert-Regel in JavaScript - alle vier Seiten rufen sie auf.
// Bis zum 15.09.2026 abends bauten sie die Regel fuenfmal selbst nach, während diese
// Funktion niemand aufrief (Fehlermuster 11: Doppelpflege). Das Gegenstueck in Python
// ist `kartenwert()` in Skripte/preise.py; wer eine ändert, ändert beide.
//
// `hatWert` sagt, ob überhaupt ein Preis bekannt ist. Ohne das behauptet eine Karte
// ohne Cardmarket-Preis 0,00 € statt "noch kein Preis".
//
// `gezeigte` ist die Menge, über die eine ANGABE ZUR KARTE gebildet wird - heute das
// Grading (Album-Chip, Karten-Kopf). Es ist der Bestand; ist nichts mehr im Bestand,
// beschreibt die Karte ihre verkauften Exemplare, sonst verloere eine verkaufte Slab
// ihre Note. Bis 15.09.2026 lasen Album-Chip und Karten-Kopf `exemplare`, die
// Dashboard-Kachel `imBestand` - bei einem verkauften gegradeten Exemplar neben einem
// vorhandenen rohen widersprachen sich drei Anzeigen (gemeldet 15.09.2026).
// Mengen, die über Geld oder Bestandsgroesse reden, nehmen weiter `imBestand`;
// die Laenge der Liste (✕-Sperre, "n Exemplare") weiter `exemplare`.
// `einzel` ist der Wert JE Exemplar im Bestand, in derselben Reihenfolge wie `imBestand`.
// Ohne das rechnete jede Seite, die einen Einzelwert braucht (teuerste Karte auf der
// Erfolge-Seite), die Regel noch einmal selbst nach - Fehlermuster 11 zum dritten Mal,
// gemeldet 16.09.2026. Wer einen Einzelwert braucht, nimmt `einzel`, nie die Formel.
//
// `einzel` traegt `null`, wo der Preis des Exemplars UNBEKANNT ist - nicht 0. Bis
// 16.09.2026 stand dort `preis ?? 0`, und ein rohes Exemplar neben einem gegradeten mit
// eigenem Wert zaehlte als 0-€-Exemplar: Das Album teilte die Summe durch die Stueckzahl
// und zeigte einen Betrag, den kein Exemplar trug, das Dashboard rechnete das unbekannte
// Exemplar als geschenkt, und "Alles bepreist" meldete "geschafft" (gemeldet 16.09.2026).
// `ohnePreis` sagt, wie viele davon es sind - jede Summe, die sie einschliesst, ist eine
// UNTERGRENZE und wird als "ab …" ausgegeben (window.ksGeld, Option `ab`).
window.ksWert = (k, preis) => {
  const ex = window.ksExemplare(k);
  const da = ex.filter((e) => !e.verkauft);
  const einzel = da.map((e) => e.wert_manuell ?? preis ?? null);
  const summe = einzel.reduce((s, v) => s + (v ?? 0), 0);
  return {
    stueck: da.length, verkauft: ex.length - da.length, gesamt: da.length ? summe : 0,
    // unveraendert: eine ganz verkaufte Karte mit Marktpreis hat einen BEKANNTEN Wert von
    // 0 € im Bestand - das ist etwas anderes als "kein Preis bekannt".
    hatWert: preis != null || da.some((e) => e.wert_manuell != null),
    ohnePreis: einzel.filter((v) => v == null).length,
    exemplare: ex, imBestand: da, gezeigte: da.length ? da : ex, einzel,
  };
};

// DIE EINZIGE Stelle, an der Geld in die Anzeige geht - JEDE Geldausgabe laeuft durch sie.
// Hier stand bis 19.09.2026 "alle sechs Seiten rufen sie auf" (Durchgang 21, Befund N3).
// Das war zweimal falsch: Es sind sieben Seiten, und nicht jede gibt Geld aus. Gemessen
// 19.09.2026, Vorkommen von window.ksGeld( je Datei: seite-dashboard 10 - seite-karte 6 -
// seite-erfolge 3 - seite-album 2 - seite-sets 2 - rahmen.js selbst 1; seite-start,
// seite-inbox und seite-ueber haben keine Geldausgabe und rufen sie darum NICHT auf.
// Die Regel lautet nicht "jede Seite ruft auf", sondern "kein Betrag ohne diese Funktion".
//
// Warum sie existiert (Reissleine 16.09.2026): Die Regel "kein Betrag ohne bekannten
// Preis" ist dreimal einzeln repariert worden - Karten-Ansicht (Durchgang 14),
// Dashboard (15), Erfolge-Seite (16). Sie wanderte, weil jede Seite ihr eigenes `euro()`
// hatte und sich jede einzeln daran erinnern musste. Hier kann man sie nicht mehr
// vergessen: Wer keinen Preis kennt, uebergibt `hatWert: false` (oder `null`), und die
// Funktion schreibt von sich aus "noch kein Preis" statt "0,00 €".
//
//   ksGeld(12.5)                          -> "12,50 €"
//   ksGeld(0, false)                      -> <span class="ks-karte__leer">noch kein Preis</span>
//   ksGeld(w.gesamt, w.hatWert, { leer: "kein Preis" })
//   ksGeld(wert, mitPreis, { kurz: true })            -> "10.626 €" (ohne Cent)
//   ksGeld(x, true, { roh: true })                    -> nur Text, ohne <span>
//   ksGeld(w.gesamt, w.hatWert, { ab: w.ohnePreis > 0 })  -> "ab 900,00 €"
//
// `roh` ist fuer Stellen, die reinen Text brauchen (textContent, Kopfzeilen ohne
// Ersatz-Stil); `leer` nur, weil "kein Preis" (in einer Zeile) und "noch kein Preis"
// (in einer Ueberschrift) bewusst verschieden klingen.
window.ksGeld = (betrag, hatWert = true, o = {}) => {
  const n = Number(betrag);
  if (!hatWert || betrag == null || !isFinite(n)) {
    const t = o.leer ?? "noch kein Preis";
    return o.roh ? t : `<span class="ks-karte__leer">${t}</span>`;
  }
  const text = n.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: o.kurz ? 0 : 2 });
  return o.ab ? `ab ${text}` : text;
};

// DIE EINZIGE Stelle, die `Wertverlauf.csv` liest. Dashboard und Erfolge-Seite zerlegten
// die Datei bis 16.09.2026 je selbst und bildeten daraus zwei verschiedene Groessen:
// das Dashboard zaehlte die ZEILEN ("367 Tage erfasst"), die Erfolge-Seite die SPANNE
// zwischen erstem und letztem Datum (366). Bei einer lueckenhaften Kurve - dem Normalfall
// fuer jeden, der das Preis-Skript nicht jede Nacht laufen laesst - liefen beide
// auseinander: zwei Eintraege im Abstand von 400 Tagen ergaben "2 Tage erfasst" neben
// "Ein Jahr Verlauf · geschafft" (gemeldet 16.09.2026).
//
// ENTSCHEIDUNG: "Tage" heisst ueberall die SPANNE - so lange wird schon mitgeschrieben.
// Wie viele Messpunkte darin liegen, sagt `punkte.length`; beide Seiten beschriften, was
// sie zeigen.
window.ksVerlauf = async (dv) => {
  let roh = "";
  try { roh = String((await dv.io.load("Wertverlauf.csv")) ?? ""); } catch (e) { roh = ""; }
  // Seit 19.09.2026 stehen hinter dem Wert zwei weitere Spalten: `einsatz` (Summe der
  // Kaufpreise im Bestand) und `stueck` (Exemplare im Bestand). Aeltere Zeilen haben sie
  // nicht - dort bleiben beide `null`, und wer damit rechnet, prueft vorher auf null.
  const punkte = roh.split("\n").map((z) => z.trim()).filter(Boolean)
    .map((z) => {
      const [d, w, e, s, m] = z.split(";");
      const zahl = (v) => { const n = Number(String(v ?? "").trim()); return String(v ?? "").trim() === "" || !isFinite(n) ? null : n; };
      return { d: String(d ?? "").trim(), w: Number(w), einsatz: zahl(e), stueck: zahl(s), markt: zahl(m) };
    })
    .filter((p) => /^\d{4}-\d{2}-\d{2}$/.test(p.d) && isFinite(p.w))
    .sort((a, b) => a.d.localeCompare(b.d));
  const tag = (iso) => new Date(iso + "T12:00:00");
  const tage = punkte.length >= 2
    ? Math.round((tag(punkte[punkte.length - 1].d) - tag(punkte[0].d)) / 86400000) : 0;
  return { punkte, tage };
};

// Die Set-Groesse steckt in der Kartennummer: "232/91" heisst, das Set hat 91 Karten.
// Kein Netzabruf noetig. DIE EINZIGE Stelle dieser Regel - sie stand bis 16.09.2026
// gleichlautend in seite-sets.js und seite-erfolge.js, und die Set-Seite und die
// Erfolge-Seite haetten dieselbe Rechnung zweimal reparieren muessen (Fehlermuster 11).
window.ksSetGroesse = (nummer) => {
  const m = String(nummer ?? "").match(/^\s*\d+\s*\/\s*(\d+)/);
  return m ? Number(m[1]) : null;
};
// Fuellstand eines Sets als Anteil 0..1, `null` wenn die Groesse unbekannt ist.
// ACHTUNG, offene Fachfrage (Bericht 14, Befund 7): Karten ueber der Set-Groesse
// (Secret Rares wie 232/91) stehen im Zaehler, koennen im Nenner aber nie vorkommen.
// Ob sie mitzaehlen, entscheidet der Sammler - hier wird nur gedeckelt, nicht geurteilt.
window.ksSetAnteil = (besitzt, groesse) => (groesse ? Math.min(1, besitzt / groesse) : null);

// Grading als EIN Satz zusammenfassen - DIE EINZIGE Stelle dieser Regel.
// Alle gezeigten Exemplare gleich gegradet -> die Note ("PSA 9"); gemischt -> "1 von 2
// gegradet"; keines gegradet -> null. `gezeigte` kommt aus window.ksWert.
// Bis 15.09.2026 nahmen Album-Chip und Dashboard-Liste einfach das ERSTE gegradete
// Exemplar und behaupteten "PSA 9", während die Karten-Ansicht daneben "1 von 2 gegradet"
// sagte - drei Anzeigen, drei Aussagen über dieselbe Karte (gemeldet 15.09.2026).
// Rueckgabe ist ROHTEXT: wer ihn in HTML setzt, maskiert ihn selbst.
// Sind ALLE gegradet, aber verschieden ("PSA 10" und "BGS 9.5"), werden beide Noten
// genannt statt "2 von 2 gegradet" - genau der Fall, fuer den das Exemplar-Modell gebaut
// wurde, sagte bis 16.09.2026 am wenigsten. Der Album-Chip kappt lange Aufzaehlungen
// mit Auslassungspunkten (oberflaeche.css, .ks-album__chip), der Karten-Kopf zeigt alles.
window.ksGradText = (gezeigte) => {
  const g = gezeigte.filter((e) => e.grading);
  if (!g.length) return null;
  const namen = [...new Set(g.map((e) => [e.grading, e.note].filter((x) => x !== "" && x != null).join(" ")))];
  return g.length === gezeigte.length ? namen.join(" · ") : `${g.length} von ${gezeigte.length} gegradet`;
};

// Bildquelle einer Karte - eine Stelle für alle Seiten (vorher dreimal fast gleich in
// seite-album, seite-karte und seite-dashboard). Loest TCGdex-Adressen und Wikilinks auf.
//
// WERBEMODUS: Steht in Dashboard.md im Kopfblock `bilder: platzhalter`, liefert diese
// Funktion statt des echten Kartenbilds einen Platzhalter aus Fotos/Platzhalter/. Grund:
// Kartenillustrationen gehören ihren Rechteinhabern, auf Werbebildern haben sie nichts
// verloren. Das Demo bleibt dabei echt - der Schalter wird nur für Screenshots gesetzt.
// Die Zuordnung hängt an der laufenden Nummer der Karte (ksNamenListe, siehe unten),
// damit dieselbe Karte auf JEDER Seite dasselbe Platzhalterbild zeigt.
// GIBT ES KEINEN PLATZHALTER, liefert die Funktion nichts - nie das echte Bild.
window.ksWerbemodus = () => {
  const d = app.vault.getAbstractFileByPath("Dashboard.md");
  const k = d ? app.metadataCache.getFileCache(d)?.frontmatter : null;
  return String(k?.bilder ?? "").trim().toLowerCase() === "platzhalter";
};
window.ksPlatzhalterBilder = () => {
  const ordner = app.vault.getAbstractFileByPath("Fotos/Platzhalter");
  if (!ordner || !ordner.children) return [];
  return ordner.children
    .filter((f) => /\.(png|jpe?g)$/i.test(f.name))
    .sort((a, b) => a.name.localeCompare(b.name));
};
// EIN Platzhalterbild je Karte, auf jeder Seite dasselbe. Bis 16.09.2026 gab es zwei
// Zweige - das Album zaehlte reihum durch, Dashboard und Karten-Ansicht nahmen einen
// Streuwert -, und dieselbe Karte zeigte je nach Seite ein anderes Bild: im Album 02.png,
// eine Kachel weiter 05.png (gemessen 16.09.2026). Grundlage ist jetzt dieselbe laufende
// Nummer, aus der auch der Fantasiename kommt (ksNamenListe): stabil je Karte, und
// alphabetisch benachbarte Karten bekommen verschiedene Motive.
window.ksPlatzhalter = (k) => {
  const bilder = window.ksPlatzhalterBilder();
  if (!bilder.length) return null;
  const sch = ksSchluessel(k);
  const i = ksNamenListe().get(sch) ?? ksStreu(sch);
  return app.vault.getResourcePath(bilder[i % bilder.length]);
};
// Werbemodus an, aber kein einziges Platzhalterbild da: Genau das ist der Zustand jedes
// frisch ausgelieferten Vaults. Bis 16.09.2026 fiel die Oberflaeche dann STUMM auf die
// echten Kartenbilder zurueck - erfundene Namen ueber echtem Artwork, und niemand erfuhr,
// warum. Jetzt sagt es die Navi auf jeder Seite, und der Schalter laesst sich gar nicht
// erst einschalten.
window.ksPlatzhalterFehlt = () => window.ksWerbemodus() && !window.ksPlatzhalterBilder().length;
// Warum eine Bildflaeche leer ist - EINE Stelle fuer Album und Karten-Ansicht. Ohne das
// liefen beide in ihren "kein Bild"-Zweig und nannten den Grund, den sie fuer diesen Fall
// kennen: "Noch kein Bild. Es kommt automatisch, sobald die Karte eine Kennung hat" - an
// einer Karte, die Kennung UND Bild hat, und 62-mal im Album (gemeldet 16.09.2026).
// Kurz gehalten, damit der Satz in eine Album-Kachel passt; was zu tun ist, sagt die
// ausfuehrliche Warnung in der Navi, die im Werbemodus auf jeder Seite steht.
window.ksBildLeerText = () => window.ksPlatzhalterFehlt() ? "Werbemodus ohne eigene Bilder" : null;
// Im Werbemodus werden auch NAMEN ersetzt, nicht nur Bilder. Ein neutrales Bild unter
// "Glurak-ex / Paldeas Schicksale" bringt nichts - Kartennamen und Set-Namen sind genauso
// geschuetzt wie die Illustration. Die Zuordnung ist stabil: dieselbe Karte trägt auf
// jedem Screenshot denselben erfundenen Namen.
const ksErfundeneNamen = [
  "Flammenhirsch", "Tiefenschlange", "Moosgeist", "Sturmwolf", "Frostwolf", "Steinbär",
  "Schattenpirscher", "Lichtlöwe", "Glutfalke", "Wellenreiter", "Rankenhüter", "Blitzluchs",
  "Eisgeweih", "Felsenkröte", "Nachtschleier", "Sonnenfink", "Aschenmarder", "Korallenwächter",
  "Blütenbock", "Donnerotter", "Reifhirsch", "Gesteinsmolch", "Dunkelkauz", "Strahlenkatze",
  "Lavaspringer", "Nebelaal", "Farnkobold", "Funkenrabe", "Kristallbär", "Schieferwurm",
  "Zwielichtfuchs", "Glanzfalter", "Rauchpanther", "Strömungsfisch", "Ranketrieb", "Gewitterhorn",
  "Frostkönig", "Basaltriese", "Schemenwolf", "Morgenhirsch",
  "Nebelkranich", "Dornenigel", "Silberdachs", "Glimmerqualle", "Aschenkauz", "Riffwächter",
  "Flusskiesel", "Wolkenreh", "Sandschleicher", "Kupferschnabel", "Tauperle", "Gletscherbock",
  "Schwefelkröte", "Windspringer", "Purpurfalter", "Erdwühler", "Sternenmarder", "Brandungswal",
  "Distelgeist", "Lehmgolem", "Silberflosse", "Nachtfarn", "Sonnenotter", "Eisenlaub",
  "Glimmstachel", "Regenbogenfink", "Rauchsalamander", "Torfkobold", "Klippenadler", "Mondkalb",
  "Harzkäfer", "Frostlibelle",
];
const ksErfundeneSets = [
  "Erste Flamme", "Tiefer Strom", "Wurzelreich", "Sturmruf",
  "Ewiges Eis", "Steinerne Wacht", "Schattenfall", "Morgenlicht",
];
const ksStreu = (text) => {
  let h = 0;
  const t = String(text ?? "");
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
  return h;
};
// Schlüssel ist die Kennung bzw. Name+Nummer - nicht der Name allein, sonst bekaemen
// dieselbe Karte in zwei Sprachen verschiedene Fantasienamen.
const ksSchluessel = (k) => String(k?.tcgdex ?? "") || (String(k?.name ?? "") + String(k?.nummer ?? ""));
const ksRoemisch = ["II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
// Kartennamen werden wie die Set-Namen der Reihe nach vergeben. Per Streuwert trugen zwei
// verschiedene Karten denselben Fantasienamen - auf dem Dashboard stand "Donnerotter" einmal
// unter "gestiegen" und einmal unter "gefallen" (gemessen 16.09.2026), was wie ein Fehler
// aussieht. Grundlage ist die sortierte Liste aller Kartenschluessel der Sammlung.
//
// GRENZE, die man kennen muss: Die Nummer ist die Position in dieser sortierten Liste.
// Solange sich der Bestand nicht aendert, traegt dieselbe Karte auf jeder Seite und in
// jeder Sitzung denselben Namen. Kommt eine Karte dazu, die sich alphabetisch vorne
// einsortiert, verschieben sich alle folgenden - Screenshots von gestern und heute zeigen
// dann andere Namen. Fuer eine Bilderserie an einem Stueck reicht das; wer die Zuordnung
// dauerhaft festnageln will, braucht einen von der Bestandsgroesse unabhaengigen
// Schluessel, und das ist eine Produktentscheidung (gemeldet 16.09.2026).
let ksNamenNummern = null;
const ksNamenListe = () => {
  if (ksNamenNummern) return ksNamenNummern;
  const schluessel = new Set();
  for (const d of app.vault.getMarkdownFiles()) {
    if (!d.path.startsWith("Karten/")) continue;
    const fm = app.metadataCache.getFileCache(d)?.frontmatter;
    if (fm) schluessel.add(ksSchluessel(fm));
  }
  ksNamenNummern = new Map([...schluessel].sort().map((x, i) => [x, i]));
  return ksNamenNummern;
};
window.ksKartenName = (k) => {
  if (!window.ksWerbemodus()) return k?.name;
  const sch = ksSchluessel(k);
  const i = ksNamenListe().get(sch) ?? (ksStreu(sch) % ksErfundeneNamen.length);
  const runde = Math.floor(i / ksErfundeneNamen.length);
  // mehr Karten als erfundene Namen: die Liste faengt von vorn an, mit roemischer Ziffer
  return ksErfundeneNamen[i % ksErfundeneNamen.length] + (runde ? " " + (ksRoemisch[runde - 1] ?? runde + 1) : "");
};
// Set-Namen werden der Reihe nach vergeben, nicht per Streuwert: zwei echte Sets fielen
// sonst auf denselben erfundenen Namen und die Set-Seite zeigte im Werbemodus 6 statt 8
// Sets (gemessen 16.09.2026). Grundlage ist die alphabetische Liste aller Set-Namen der
// Sammlung. Dieselbe Grenze wie bei den Kartennamen oben: stabil, solange der Bestand
// steht - ein neues Set verschiebt die Namen aller alphabetisch dahinterliegenden.
let ksSetNummern = null;
const ksSetListe = () => {
  if (ksSetNummern) return ksSetNummern;
  const namen = new Set();
  for (const d of app.vault.getMarkdownFiles()) {
    if (!d.path.startsWith("Karten/")) continue;
    const s = app.metadataCache.getFileCache(d)?.frontmatter?.set;
    if (s) namen.add(String(s));
  }
  ksSetNummern = new Map([...namen].sort().map((n, i) => [n, i]));
  return ksSetNummern;
};
window.ksSetName = (k) => {
  if (!window.ksWerbemodus()) return k?.set;
  const echt = String(k?.set ?? "");
  if (!echt) return echt;
  const i = ksSetListe().get(echt) ?? (ksStreu(echt) % ksErfundeneSets.length);
  const runde = Math.floor(i / ksErfundeneSets.length);
  // mehr Sets als erfundene Namen: die Liste faengt von vorn an, mit roemischer Ziffer
  return ksErfundeneSets[i % ksErfundeneSets.length] + (runde ? " " + (ksRoemisch[runde - 1] ?? runde + 1) : "");
};
// Der Originalname (japanisch, koreanisch) verrät die Herkunft ebenso - im Werbemodus weg.
window.ksOriginalName = (k) => (window.ksWerbemodus() ? null : k?.name_original);
// Notiztexte der Demo nennen Cardmarket und TCGdex; im Werbemodus bleibt das Feld leer.
window.ksNotiz = (k) => (window.ksWerbemodus() ? null : k?.notiz);
// Quellenbezeichnung in der Karten-Ansicht.
// Die Kennung (z.B. "sv04.5-232") ist ein echter Set-Code des Kartenherstellers und
// verrät die Herkunft genauso wie der Name - im Werbemodus wird sie aus dem erfundenen
// Set-Namen neu gebildet, damit die Kachel nicht leer bleibt.
window.ksKennung = (k) => {
  if (!window.ksWerbemodus()) return k?.tcgdex;
  if (!k?.tcgdex) return null;
  const set = String(window.ksSetName(k) ?? "");
  const kurz = set.split(/\s+/).map((w) => w.slice(0, 2)).join("").toLowerCase() || "ka";
  const nr = String(k?.nummer ?? "").split("/")[0] || String(ksStreu(ksSchluessel(k)) % 200);
  return `${kurz}-${nr}`;
};
// Eine Zertifikatsnummer (PSA, BGS, CGC) ist beim Gradinganbieter oeffentlich nachschlagbar
// und verraet damit genau die Karte, die der Werbemodus verbergen soll (gemeldet 16.09.2026
// beim ersten Werbefoto). Ersetzt werden nur die Ziffern - Laenge und Schreibweise bleiben.
window.ksZertifikat = (wert) => {
  const t = String(wert ?? "");
  if (!window.ksWerbemodus() || !t) return wert;
  let h = ksStreu(t);
  return t.replace(/[0-9]/g, () => { h = (h * 31 + 7) >>> 0; return String(h % 10); });
};
window.ksQuelle = () => (window.ksWerbemodus() ? "Marktpreise" : "Cardmarket");
window.ksKennungQuelle = () => (window.ksWerbemodus() ? "Kartendatenbank" : "TCGdex");

window.ksBild = (k, wert, quellPfad) => {
  // Im Werbemodus wird NIE das echte Kartenbild geliefert - fehlt der Platzhalter,
  // bleibt die Stelle leer und die Navi sagt warum (window.ksPlatzhalterFehlt).
  // Lieber eine leere Flaeche als eine echte Illustration unter einem erfundenen Namen.
  if (window.ksWerbemodus()) return window.ksPlatzhalter(k);
  const v = wert === undefined ? k?.bild : wert;
  if (v === undefined || v === null || String(v).trim() === "") return null;
  const t = String(v).trim();
  if (/^https?:\/\//i.test(t)) return t;
  const m = t.match(/^!?\[\[(.+?)(?:\|.*)?\]\]$/);
  const pfad = m ? m[1] : t.replace(/^"|"$/g, "");
  const datei = app.metadataCache.getFirstLinkpathDest(pfad, quellPfad ?? k?.file?.path ?? "");
  return datei ? app.vault.getResourcePath(datei) : null;
};


// Eine Rueckfrage im eigenen Haus (19.09.2026, Marks Wort: "mach hier Abbrechen oder Ja").
// window.confirm nimmt seine Knopftexte vom Betriebssystem - auf einem englischen macOS
// steht dort "Cancel" und "OK", und daran laesst sich nichts aendern. Dieser Dialog steht
// IM Rahmen, spricht Deutsch und sieht aus wie der Rest.
//
// `text` wird als Text eingesetzt, nicht als Markup - darin steht ein Kartenname, also
// Fremddaten (dieselbe Regel wie beim Nutzernamen im Dashboard-Kopf).
// Escape und ein Klick neben den Kasten bedeuten Abbrechen; der gefaehrliche Knopf hat
// NICHT den Fokus, sonst bestaetigt ein gedankenloses Enter.
window.ksFrage = (dok, text, jaText = "Ja") => new Promise((fertig) => {
  const huelle = dok.createElement("div");
  huelle.className = "ks-dialog";
  const kasten = dok.createElement("div");
  kasten.className = "ks-dialog__kasten";
  const satz = dok.createElement("div");
  satz.className = "ks-dialog__text";
  satz.textContent = text;
  const leiste = dok.createElement("div");
  leiste.className = "ks-dialog__knoepfe";
  const nein = dok.createElement("button");
  nein.type = "button"; nein.className = "ks-knopf ks-knopf--leise"; nein.textContent = "Abbrechen";
  const ja = dok.createElement("button");
  ja.type = "button"; ja.className = "ks-knopf"; ja.textContent = jaText;
  leiste.append(nein, ja);
  kasten.append(satz, leiste);
  huelle.append(kasten);
  dok.body.append(huelle);

  const schliessen = (antwort) => {
    dok.removeEventListener("keydown", taste, true);
    huelle.remove();
    fertig(antwort);
  };
  const taste = (e) => {
    if (e.key === "Escape") { e.preventDefault(); schliessen(false); }
    if (e.key === "Enter" && dok.activeElement === ja) { e.preventDefault(); schliessen(true); }
  };
  nein.addEventListener("click", () => schliessen(false));
  ja.addEventListener("click", () => schliessen(true));
  huelle.addEventListener("click", (e) => { if (e.target === huelle) schliessen(false); });
  dok.addEventListener("keydown", taste, true);
  nein.focus();
});

window.ksKette = window.ksKette || Promise.resolve();
window.ksOffen = window.ksOffen || 0;
// Jeder Klick schreibt UND baut die Ansicht neu. Ohne Reihenfolge ueberholen sich die
// Vorgaenge - von fuenf schnellen Klicks wirkte nur einer (gemeldet 15.09.2026).
// Jetzt laufen sie nacheinander, und der Neuaufbau kommt einmal, wenn nichts mehr offen ist.
//
// `danach(ok)` bekommt mitgeteilt, ob der Schritt durchkam, und die zurueckgegebene
// Zusage loest auf dasselbe `ok` auf. Ohne das meldete die Kachel auch nach einem
// gescheiterten Schreibvorgang "Gespeichert ✓" - der catch schluckte den Fehler und die
// Kette lief weiter, als wäre nichts gewesen.
window.ksNacheinander = (arbeit, danach) => {
  window.ksOffen++;
  let ok = true;
  window.ksKette = window.ksKette
    .then(arbeit)
    .catch((e) => { ok = false; console.error("ks: Schritt fehlgeschlagen", e); new Notice("Die Änderung konnte nicht gespeichert werden."); })
    .then(() => {
      window.ksOffen--;
      if (window.ksOffen === 0 && danach) {
        // Entprellt: Zwei Neuaufbauten duerfen sich nicht ueberlappen. Sonst raeumen sie
        // gegenseitig ihre Rahmen weg, und die Ansicht bleibt leer (gemeldet 15.09.2026:
        // "wenn ich schnell hintereinander loesche, wird die Ansicht einfach schwarz").
        clearTimeout(window.ksNeuTimer);
        window.ksNeuTimer = setTimeout(() => { if (window.ksOffen === 0) danach(ok); }, 140);
      }
      return ok;
    });
  return window.ksKette;
};


// Die Exemplar-Liste so, wie sie in den Kopfblock geschrieben wird: aus den alten Feldern
// gebaut, ohne leere Werte. Stand bis 18.09.2026 dreimal gleichlautend im Code (Exemplar
// dazu, Exemplar weg, Feld speichern) - jetzt eine Stelle (Fehlermuster 11).
window.ksExemplareSchreibbar = (fm) => window.ksExemplare(fm).map((x) => {
  const sauber = {};
  for (const [n, v] of Object.entries(x)) if (v !== "" && v != null) sauber[n] = v;
  return sauber;
});
// Felder, die vor dem Exemplar-Modell auf Kartenebene standen. Sobald die Liste
// `exemplare` da ist, liest sie niemand mehr (ksExemplare nimmt die Liste) - sie blieben
// aber bis 18.09.2026 als tote Angaben in der Notiz stehen (Fuer-Mark 32; Marks Wort:
// entfernen). DIE EINE Stelle der Umstellung: Liste bauen UND Altfelder raeumen.
window.ksAltfelder = ["zustand", "kaufpreis", "grading", "note", "zertifikat", "verkauft", "verkaufspreis", "wert_manuell", "anzahl"];
window.ksExemplareUmstellen = (fm) => {
  if (!Array.isArray(fm.exemplare)) fm.exemplare = window.ksExemplareSchreibbar(fm);
  for (const n of window.ksAltfelder) delete fm[n];
};

// ---- Karte anlegen ohne Claude (18.09.2026) -------------------------------------------------
//
// Anforderung 18.09.2026: "Die Sammlung muss ohne Claude benutzbar sein." Alles andere
// rechnet sich laengst selbst - Erfolge, Gesamtwert und Set-Fortschritt lesen die Notizen
// live. Was fehlte, war genau eins: eine Karte anlegen, ohne dass jemand die Notiz
// schreibt. Das hier ist DIE EINE Stelle dafuer - Album, Inbox und Karten-Ansicht rufen
// sie auf, keine Seite baut die Suche oder den Schreibweg selbst nach (Fehlermuster 11).
//
// Was hinausgeht, ist nur Kartenname und Nummer (Datenschutzregel in CLAUDE.md) - nie
// Bestand, Werte oder Kaufpreise. Gemessen 18.09.2026: fetch aus Obsidian gegen
// api.tcgdex.net antwortet mit 200 und CORS "*"; `name` plus `localId` liefert genau
// einen Treffer, und die Cardmarket-Preise kommen im selben Abruf mit.

// DIE EINE Sprachtabelle (18.09.2026, Entscheidung: alle Sprachen, die TCGdex bedient).
// Bis dahin standen vier Listen getrennt - hier, im Formular, in seite-karte.js (Auswahl
// und Cardmarket-Nummern) und in seite-album.js (Chips) - und nur drei von fuenf
// angebotenen Sprachen konnten suchen (Fuer-Mark 28). Jetzt leiten sich alle daraus ab.
//   tcgdex: Sprachkennung der API (null = TCGdex hat keine Daten, dann nur "ohne Suche")
//   kurz:   Chip im Album
//   cm:     Sprachnummer im Cardmarket-Link (null = Cardmarket fuehrt die Sprache nicht)
// Das Gegenstueck in Python ist SPRACHCODES in Skripte/preise.py - wer eine ergaenzt,
// ergaenzt beide. Gemessen 18.09.2026: fr, it, es, pt liefern Karten mit Bild und
// Cardmarket-Preis; nl und pl liefern Karten, Preise sind dort nicht sicher; ko und zh
// antworten mit 404.
window.ksSprachTabelle = {
  Deutsch:        { tcgdex: "de", kurz: "DE",  cm: 3 },
  Englisch:       { tcgdex: "en", kurz: "EN",  cm: 1 },
  Französisch:    { tcgdex: "fr", kurz: "FR",  cm: 2 },
  Italienisch:    { tcgdex: "it", kurz: "IT",  cm: 5 },
  Spanisch:       { tcgdex: "es", kurz: "ES",  cm: 4 },
  Portugiesisch:  { tcgdex: "pt", kurz: "PT",  cm: 8 },
  Niederländisch: { tcgdex: "nl", kurz: "NL",  cm: null },
  Polnisch:       { tcgdex: "pl", kurz: "PL",  cm: null },
  Japanisch:      { tcgdex: "ja", kurz: "JP",  cm: 7 },
  Koreanisch:     { tcgdex: null, kurz: "KOR", cm: 10 },
  Chinesisch:     { tcgdex: null, kurz: "CN",  cm: 6 },
};
window.ksSprachen = Object.keys(window.ksSprachTabelle);
window.ksTcgdexSprachen = Object.fromEntries(Object.entries(window.ksSprachTabelle).filter(([, v]) => v.tcgdex).map(([k, v]) => [k, v.tcgdex]));
const ksTcgdexApi = "https://api.tcgdex.net/v2";

// Ein Abruf mit Zeitschranke. Ohne sie haengt der Knopf bei totem Netz fuer immer auf
// "Suche laeuft", und niemand erfaehrt warum.
const ksHolen = async (url) => {
  const stopp = new AbortController();
  const wecker = setTimeout(() => stopp.abort(), 15000);
  try {
    const r = await fetch(url, { signal: stopp.signal });
    if (r.status === 404) return null;
    // 429 "zu viele Anfragen" und 503 "ueberlastet" sind KEINE gewoehnlichen Fehler: Sie
    // sagen, dass wir zu schnell sind. Der Preislauf erkennt sie an der Marke und geht auf
    // Schrittgeschwindigkeit zurueck, statt weiterzuhaemmern (19.09.2026).
    if (r.status === 429 || r.status === 503) {
      const e = new Error(`TCGdex bremst uns (${r.status})`);
      e.ksBremse = true;
      throw e;
    }
    if (!r.ok) throw new Error(`TCGdex antwortet mit ${r.status}`);
    return await r.json();
  } finally { clearTimeout(wecker); }
};

// Kein fremder Fehlertext in der Oberflaeche (Durchgang 18, Befund 3). `fetch` wirft bei
// totem Netz einen TypeError mit der Meldung "Failed to fetch" - englisch, und fuer einen
// Kaeufer ohne jede Bedeutung. Der freundliche deutsche Satz stand bis dahin nur am
// 15-Sekunden-Abbruch, also im selteneren Fall. Die Rohmeldung geht nicht verloren: an
// jeder Aufrufstelle steht ein console.error davor.
// `sonst` ist der Satz fuer alles, was hier niemand vorhergesehen hat - er nennt den Ort,
// an dem der Grund steht, statt ihn zu verschweigen.
window.ksFehlerText = (err, sonst) =>
  err?.name === "AbortError" ? "TCGdex antwortet nicht. Prüfe die Netzverbindung."
  : err?.name === "TypeError" ? "Keine Verbindung zu TCGdex. Prüfe die Netzverbindung."
  // Was dieses Skript selbst wirft, ist deutsch und gehoert in die Oberflaeche
  // ("TCGdex antwortet mit 503", "Die Vorlage Vorlagen/Karte.md fehlt …"): ein `new Error`
  // heisst schlicht "Error". Was die Umgebung wirft, traegt einen eigenen Namen -
  // TypeError, AbortError, DOMException - und bleibt draussen.
  : (err?.name === "Error" && err.message) ? err.message
  : sonst;

// Nummer wie auf der Karte: "183/165" oder nur "183". Vor dem Schraegstrich steht, was
// TCGdex als localId kennt.
window.ksLocalId = (nummer) => String(nummer ?? "").trim().split("/")[0].trim();

// Suche: Name und/oder Nummer in einer Sprache. Liefert VOLLE Karten (mit Set, Seltenheit,
// Preisen), hoechstens `max` Stueck. Die Kurzliste der API traegt nur id, Name und Bild -
// das Set steht erst in der vollen Karte, und ohne Set kann niemand zwischen zwei
// "Glurak 4" waehlen. Darum ein zweiter Abruf je Treffer, parallel.
// `set` grenzt die Suche beim Abruf ein (`set.name`, Teilwort): "glurak" allein hat 112
// Treffer, mit Set "151" drei (gemessen 18.09.2026). Der Filter MUSS an die API gehen -
// ein erster Bau filterte die Kurzliste erst hier und nahm dafuer nur ihre ersten 40
// Eintraege: Glurak-ex 183 und 199 aus Set 151 lagen dahinter und fehlten (gemessen).
window.ksTcgdexSuche = async ({ name, nummer, sprache, set, max = 12 }) => {
  const spr = window.ksTcgdexSprachen[sprache];
  if (!spr) throw new Error(`Für ${sprache || "diese Sprache"} hat TCGdex keine Daten.`);
  const q = new URLSearchParams();
  if (String(name ?? "").trim()) q.set("name", String(name).trim());
  const lid = window.ksLocalId(nummer);
  if (lid) q.set("localId", lid);
  if (![...q.keys()].length) throw new Error("Gib einen Namen oder eine Nummer ein.");
  if (String(set ?? "").trim()) q.set("set.name", String(set).trim());
  let kurz = (await ksHolen(`${ksTcgdexApi}/${spr}/cards?${q}`)) ?? [];
  // Die API filtert auch die Nummer als TEILWORT: "6" trifft 006, 016, 026 ... (39 Treffer
  // im Set 151, gemessen 18.09.2026). Darum hier auf die exakte Nummer eingrenzen - als
  // Zahl, damit "25" und "025" dasselbe sind, denn auf der Karte steht "025/165".
  if (lid) {
    const gleich = (a, b) => (/^\d+$/.test(a) && /^\d+$/.test(b)) ? Number(a) === Number(b) : a.toLowerCase() === b.toLowerCase();
    kurz = kurz.filter((t) => gleich(String(t.localId ?? ""), lid));
  }
  // Gedeckelt wird vor dem zweiten Abruf, sonst holt "glurak" 112 volle Karten.
  const voll = (await Promise.all(kurz.slice(0, max).map((t) => ksHolen(`${ksTcgdexApi}/${spr}/cards/${t.id}`))))
    .filter(Boolean);
  // Japanische Karten tragen ihren Namen in Schrift, die hier niemand tippt. Fuer den
  // Dateinamen und die Anzeige kommt der lateinische Name aus der englischen Ausgabe
  // derselben Kennung; der japanische wandert nach name_original.
  if (spr === "ja") {
    for (const k of voll) {
      const en = await ksHolen(`${ksTcgdexApi}/en/cards/${k.id}`).catch(() => null);
      if (en?.name) { k.name_original = k.name; k.name = en.name; }
    }
  }
  return { treffer: voll.slice(0, max), gesamt: kurz.length };
};

// Aus einer vollen TCGdex-Karte die Felder der Notiz - DIESELBE Regel wie in
// Skripte/preise.py (Wert = kleinster der vier Cardmarket-Schnitte; ohne Trend kein Preis).
// Wer sie hier aendert, aendert sie dort.
window.ksTcgdexFelder = (k, sprache) => {
  const f = { name: k.name, sprache, tcgdex: k.id };
  if (k.name_original) f.name_original = k.name_original;
  if (k.set?.name != null) f.set = String(k.set.name);
  const amtlich = k.set?.cardCount?.official;
  f.nummer = amtlich ? `${k.localId}/${amtlich}` : String(k.localId ?? "");
  if (k.rarity) f.seltenheit = k.rarity;
  if (k.image) f.bild = `${k.image}/high.png`;
  const cm = k.pricing?.cardmarket;
  if (cm && cm.trend != null) {
    const werte = ["avg1", "avg7", "avg30", "trend"].map((n) => cm[n]).filter((v) => v != null && v !== 0);
    f.preis = werte.length ? Math.min(...werte) : cm.trend;
    if (cm.avg1 != null) f.preis_tag = cm.avg1;
    if (cm.avg7 != null) f.preis_7 = cm.avg7;
    if (cm.avg30 != null) f.preis_30 = cm.avg30;
    f.preis_trend = cm.trend;
    if (cm.low != null) f.preis_min = cm.low;
    // ZWEI Zeitpunkte, und sie heissen mit Absicht verschieden (Marks Wort 18.09.2026:
    // "wenn man preis aktulisiert muss natuerlich auch das datum aktuell sein"):
    //   preis_stand  = wann CARDMARKET seine Zahlen gerechnet hat (kommt von dort mit)
    //   preis_geholt = wann WIR sie geholt haben (unsere Uhr, mit Uhrzeit)
    // Der erste sagt, wie alt die Zahlen sind; der zweite, ob der eigene Vault auf Stand
    // ist. Nach einem Klick auf "Preise aktualisieren" ist nur der zweite von jetzt -
    // Cardmarket rechnet nachts, nicht auf Zuruf.
    if (cm.updated) f.preis_stand = String(cm.updated).slice(0, 10);
    if (cm.idProduct != null) f.cardmarket_id = cm.idProduct;
  }
  // `preis_geholt` stand bis 19.09.2026 INNERHALB des `if (cm && cm.trend != null)` und
  // wurde damit nur gesetzt, wenn Cardmarket einen Preis lieferte (Durchgang 20, Befund 3).
  // Eine Karte ohne Cardmarket-Trend - Promos, sehr neue Sets, japanische Ausgaben - bekam
  // beim Preislauf gar keinen neuen Stempel und hielt die Dashboard-Kachel fuer immer auf
  // ihrem alten Datum fest; jeder weitere Klick auf "Jetzt aktualisieren" blieb folgenlos.
  // Der Stempel sagt laut seinem eigenen Namen, wann WIR gefragt haben, nicht ob die Antwort
  // einen Preis enthielt - gefragt wurde auch hier. Er steht darum jetzt ausserhalb.
  f.preis_geholt = window.ksJetzt();
  return f;
};

// ---- Preise aktualisieren ohne Claude (18.09.2026) ------------------------------------------
//
// Bis heute holte nur Skripte/preise.py die Preise, und gestartet hat es eine geplante
// Claude-Aufgabe. Fuer einen Kaeufer ist das kein Weg: Er hat weder Claude Code noch ein
// Terminal. TCGdex antwortet mit CORS "*" (gemessen 18.09.2026), also darf Obsidian selbst
// fragen - derselbe Abruf, der beim Anlegen schon laeuft.
//
// Was hinausgeht, ist NUR die Kartenkennung (Datenschutzregel in CLAUDE.md) - nie Bestand,
// Werte oder Kaufpreise. Zwischen zwei Abrufen liegt eine Pause: TCGdex nennt kein Limit,
// und wer keins kennt, benimmt sich.

// Eine Karte an ihrer Kennung. Die Kennung ist bei TCGdex sprachunabhaengig, die Preise
// aber nicht in jeder Ausgabe vorhanden - darum zuerst die Sprache der Notiz, dann die
// uebrigen. Dieselbe Reihenfolge wie `hole()` in Skripte/preise.py.
window.ksKarteHolen = async (kennung, sprache) => {
  const erst = window.ksTcgdexSprachen[sprache];
  const reihe = [...(erst ? [erst] : []), ...Object.values(window.ksTcgdexSprachen).filter((s) => s !== erst)];
  for (const spr of reihe) {
    const k = await ksHolen(`${ksTcgdexApi}/${spr}/cards/${encodeURIComponent(kennung)}`);
    if (k) return k;
  }
  return null;
};

// Nur diese Felder werden ueberschrieben. Name, Set, Nummer und Seltenheit bleiben
// unangetastet - die kann man seit 18.09.2026 mit dem Stift von Hand berichtigen, und ein
// Preislauf darf eine Berichtigung nicht wieder wegraeumen.
window.ksPreisFelder = ["preis", "preis_tag", "preis_7", "preis_30", "preis_trend", "preis_min", "preis_stand", "preis_geholt", "cardmarket_id"];

window.ksKartenDateien = () => app.vault.getMarkdownFiles().filter((f) => f.path.startsWith("Karten/"));

// Zeitpunkt als "YYYY-MM-DD HH:MM" in ORTSZEIT. toISOString() waere UTC und schriebe nach
// Mitternacht den Vortag. Diese Schreibweise sortiert sich als Text richtig - darauf
// verlaesst sich die Dashboard-Kachel, die den aeltesten Abruf sucht.
window.ksJetzt = () => new Date().toLocaleString("sv-SE").slice(0, 16);
window.ksHeute = () => window.ksJetzt().slice(0, 10);

// Haengt eine Tageszeile an Wertverlauf.csv an - ein Eintrag je Tag, ein zweiter Lauf am
// selben Tag ersetzt ihn. Gegenstueck zu verlauf_schreiben() in Skripte/preise.py; gelesen
// wird die Datei weiter allein von window.ksVerlauf.
//
// VIER Spalten seit 19.09.2026 (Marks Bild: "im endeffekt ist es nichts anderes wie bei
// aktien"). Ein Depotwert steigt auch, wenn man einzahlt - das ist keine Rendite. Beim
// Sammeln ist ein Kauf die Einzahlung und ein Verkauf die Auszahlung, und bis hierher
// zeigte die Kurve beides als Wertentwicklung. `einsatz` (Summe der Kaufpreise im Bestand)
// und `stueck` (Exemplare im Bestand) aendern sich NUR durch Zu- und Abgang, nie durch den
// Markt - ihre Differenz zwischen zwei Messpunkten ist der Zufluss, der Rest ist Markt.
// Die 367 alten Zeilen haben zwei Spalten und bleiben, wie sie sind; der Leser kommt mit
// beidem zurecht.
//
// FUENFTE Spalte `markt` seit 19.09.2026: die aufaddierte Marktbewegung. Der erste Bau
// rechnete sie aus `einsatz` (Gesamtveraenderung minus Veraenderung der Kaufpreise) - das
// ist falsch, sobald Wert und Kaufpreis auseinanderliegen: Marks geloeschte Karte war
// 890 EUR wert, ihr Kaufpreis unbekannt, und die Rechnung haette die ganzen 890 EUR dem
// Markt zugeschlagen. Der Preislauf kennt dagegen fuer jede Karte den ALTEN und den NEUEN
// Preis - ihre Differenz IST die Marktbewegung, unabhaengig davon, was dazukommt oder
// weggeht, und ohne dass ein einziger Kaufpreis gepflegt sein muss.
window.ksVerlaufKopf = "datum;gesamtwert;einsatz;stueck;markt";
window.ksVerlaufSchreiben = async (gesamt, einsatz, stueck, markt) => {
  const ad = app.vault.adapter, pfad = "Wertverlauf.csv";
  let zeilen = [];
  if (await ad.exists(pfad)) zeilen = String(await ad.read(pfad)).split("\n").map((z) => z.trim()).filter(Boolean);
  // Die Kopfzeile wird mitgezogen, sobald neue Spalten dazukommen - die Datenzeilen nicht.
  if (zeilen.length && /^datum;/i.test(zeilen[0])) zeilen[0] = window.ksVerlaufKopf;
  else zeilen.unshift(window.ksVerlaufKopf);
  const heute = window.ksHeute();
  zeilen = zeilen.filter((z, i) => i === 0 || !z.startsWith(heute));
  const n = (v) => (v == null || !isFinite(v) ? "" : String(v));
  zeilen.push(`${heute};${gesamt.toFixed(2)};${n(einsatz?.toFixed(2))};${n(stueck)};${n(markt?.toFixed(2))}`);
  await ad.write(pfad, zeilen.join("\n") + "\n");
};

// Der zuletzt geschriebene Markt-Stand - die Basis, auf die der naechste Lauf seine eigene
// Bewegung addiert. Fehlt er (alle Zeilen aelter als der 19.09.2026), faengt die Reihe bei
// 0 an: Die Marktbewegung IST eine Reihe ab einem Nullpunkt, nur Differenzen zaehlen.
window.ksMarktStand = async () => {
  const ad = app.vault.adapter, pfad = "Wertverlauf.csv";
  if (!(await ad.exists(pfad))) return 0;
  const zeilen = String(await ad.read(pfad)).split("\n").map((z) => z.trim()).filter(Boolean);
  for (let i = zeilen.length - 1; i > 0; i--) {
    const m = Number(zeilen[i].split(";")[4]);
    if (isFinite(m) && String(zeilen[i].split(";")[4] ?? "").trim() !== "") return m;
  }
  return 0;
};

// Der Lauf selbst. `melden(stand)` wird nach jeder Karte gerufen, damit der Knopf zeigen
// kann, wie weit er ist. Ein Netzfehler bei einer Karte beendet den Lauf nicht - er zaehlt
// und geht weiter, sonst kostet eine einzige tote Kennung alle uebrigen Preise.
//
// Der Zustand des Laufs steht am FENSTER, nicht am Knopf (19.09.2026): Waehrend der Lauf
// schreibt, baut Dataview die Seite neu - der Knopf mit seiner `disabled`-Sperre und
// seinem Fortschritt ist dann weg, und ein zweiter Klick startete einen zweiten Lauf auf
// dieselben Notizen. Am Fenster ueberlebt die Sperre jeden Neuaufbau, und die frisch
// gebaute Kachel kann den Fortschritt sofort wieder anzeigen.
window.ksPreislauf = window.ksPreislauf || { laeuft: false, fertig: 0, gesamt: 0 };
// Ohne Auslassungspunkte (Marks Wort 19.09.2026: "die punkte noch weg") - dass es laeuft,
// zeigt der Balken im Knopf.
window.ksPreislaufText = () => window.ksPreislauf.laeuft
  ? `${window.ksPreislauf.fertig} von ${window.ksPreislauf.gesamt}` : "Jetzt aktualisieren";
// Fortschritt in Prozent, fuer den Balken IM Knopf (Marks Wunsch 19.09.2026). Eine Stelle,
// weil zwei Wege ihn brauchen: der Seitenaufbau und die Meldung nach jeder Karte.
window.ksPreislaufProzent = () => window.ksPreislauf.gesamt
  ? Math.round(window.ksPreislauf.fertig / window.ksPreislauf.gesamt * 100) : 0;
// Setzt Text, Sperre und Balken an EINEM Knopf - damit Seitenaufbau und laufende Meldung
// nicht auseinanderlaufen koennen.
window.ksPreisKnopfZeigen = (b) => {
  if (!b) return;
  const laeuft = window.ksPreislauf.laeuft;
  b.textContent = window.ksPreislaufText();
  b.disabled = laeuft;
  b.classList.toggle("ks-knopf--fortschritt", laeuft);
  b.style.setProperty("--ks-fortschritt", (laeuft ? window.ksPreislaufProzent() : 0) + "%");
};

window.ksPreiseZiehen = async (melden) => {
  if (window.ksPreislauf.laeuft) return null;
  const dateien = window.ksKartenDateien();
  const stand = { gesamt: dateien.length, fertig: 0, neu: 0, ohneKennung: 0, ohnePreis: 0, fehler: 0, wert: 0 };
  window.ksPreislauf = { laeuft: true, fertig: 0, gesamt: dateien.length };
  try {
    return await ksPreislaufArbeit(dateien, stand, melden);
  } finally {
    window.ksPreislauf = { laeuft: false, fertig: 0, gesamt: 0 };
  }
};

// Wie schnell der Lauf fragt. Gemessen 19.09.2026: TCGdex antwortet in 124 ms (12 Abrufe,
// 116 bis 135). Einzeln mit 120 ms Pause waeren das 244 ms je Karte - bei 500 Karten zwei
// Minuten. Zu dritt und ohne Pause sind es rund 20 Sekunden, also etwa 12 Anfragen je
// Sekunde; TCGdex nennt kein Limit, und das ist fuer eine oeffentliche Schnittstelle noch
// im hoeflichen Bereich.
//
// `bremse()` ist die Versicherung dahinter: Sagt TCGdex einmal 429 oder 503, geht der Lauf
// fuer den Rest auf eine Karte mit 300 ms Pause zurueck. Ein Produkt, das bei Gegenwehr
// weiterhaemmert, bringt sich bei allen Kaeufern gleichzeitig um den Dienst.
window.ksPreisTempo = { gleichzeitig: 3, pause: 0 };

const ksPreislaufArbeit = async (dateien, stand, melden) => {
  let summe = 0, einsatz = 0, stueck = 0, bewegung = 0;
  let gleichzeitig = window.ksPreisTempo.gleichzeitig, pause = window.ksPreisTempo.pause;
  const bremse = () => {
    if (gleichzeitig === 1) return;
    gleichzeitig = 1; pause = 300; stand.gebremst = true;
    console.warn("ks: TCGdex bremst - der Lauf geht auf Schrittgeschwindigkeit zurück");
  };

  // Eine Karte holen und schreiben. Der Reihe nach summiert wird erst danach, im Rueckgabe-
  // wert: Drei Karten laufen gleichzeitig, und zwei Zaehler gleichzeitig hochzuzaehlen
  // waere eine Wette darauf, wer zuerst fertig ist.
  const eine = async (datei) => {
    const fm = app.metadataCache.getFileCache(datei)?.frontmatter ?? {};
    const kennung = String(fm.tcgdex ?? "").trim();
    const altPreis = window.ksZahl(fm.preis);   // der Preis VOR diesem Lauf
    let preis = altPreis;
    if (!kennung) stand.ohneKennung++;
    else {
      try {
        const k = await window.ksKarteHolen(kennung, fm.sprache);
        const f = k ? window.ksTcgdexFelder(k, fm.sprache) : null;
        // Bis 19.09.2026 sprang der ganze Schreibvorgang ab, sobald Cardmarket keinen Preis
        // lieferte (`if (!f || f.preis == null) stand.ohnePreis++;` ohne else-Zweig) - und
        // damit blieb auch `preis_geholt` stehen (Durchgang 20, Befund 3). Jetzt wird
        // geschrieben, sobald TCGdex geantwortet hat: Preisfelder nur, wo `f` welche traegt
        // (`f[n] !== undefined`), sonst allein der Abruf-Stempel. Ein vorhandener alter Preis
        // bleibt dabei unberuehrt - er ist das Beste, was wir haben, solange keiner nachkommt.
        if (!f) stand.ohnePreis++;
        else {
          await app.fileManager.processFrontMatter(datei, (kopf) => {
            for (const n of window.ksPreisFelder) if (f[n] !== undefined) kopf[n] = f[n];
            // Ein Bild nur, wo keins steht - ein selbst abgelegtes Foto gewinnt.
            if (!String(kopf.bild ?? "").trim() && f.bild) kopf.bild = f.bild;
          });
          if (f.preis == null) stand.ohnePreis++;
          else { preis = f.preis; stand.neu++; }
        }
      } catch (e) {
        console.error("ks: Preis holen", datei.path, e);
        if (e?.ksBremse) bremse();
        stand.fehler++;
      }
    }
    // Aus dem gerade geschriebenen Preis gerechnet, nicht aus dem Zwischenspeicher: der
    // holt die Aenderung erst spaeter nach, und der Verlauf trueg dann den alten Stand.
    const w = window.ksWert(fm, preis);
    summe += w.gesamt;
    // Die beiden Groessen, die der Markt NICHT bewegt (siehe ksVerlaufSchreiben):
    stueck += w.stueck;
    for (const e of w.imBestand) einsatz += window.ksZahl(e.kaufpreis) ?? 0;
    // Was der Markt SEHR WOHL bewegt, und nur er: derselbe Bestand, alter gegen neuen Preis.
    // Eine Karte, die es beim letzten Lauf noch nicht gab, hat keinen alten Preis und traegt
    // hier nichts bei - sie ist Zugang, keine Bewegung.
    if (altPreis != null) bewegung += w.gesamt - window.ksWert(fm, altPreis).gesamt;
    stand.fertig++;
    window.ksPreislauf.fertig = stand.fertig;
    melden?.(stand);
  };

  // Gruppenweise, damit `gleichzeitig` und `pause` mitten im Lauf greifen koennen - eine
  // Bremse, die erst beim naechsten Klick wirkt, waere keine.
  //
  // Weitergezaehlt wird um die GROESSE DER GRUPPE, nicht um `gleichzeitig`: Der Wert sinkt
  // mitten im Lauf, wenn die Bremse greift, und `i += gleichzeitig` haette danach den Rest
  // der eben verarbeiteten Gruppe noch einmal geholt und geschrieben (gemessen 19.09.2026:
  // 42 Durchlaeufe bei 40 Karten).
  let i = 0;
  while (i < dateien.length) {
    const gruppe = dateien.slice(i, i + gleichzeitig);
    i += gruppe.length;
    await Promise.all(gruppe.map(eine));
    if (pause) await new Promise((f) => setTimeout(f, pause));
  }
  stand.wert = Math.round(summe * 100) / 100;
  stand.einsatz = Math.round(einsatz * 100) / 100;
  stand.stueck = stueck;
  stand.bewegung = Math.round(bewegung * 100) / 100;
  stand.markt = Math.round(((await window.ksMarktStand()) + bewegung) * 100) / 100;
  await window.ksVerlaufSchreiben(stand.wert, stand.einsatz, stand.stueck, stand.markt);
  return stand;
};

// Gibt es die Karte schon?  DIE Stelle fuer alle drei Wege (Trefferliste, Anlegen,
// Verknuepfen) - eine Notiz ist dieselbe Karte, wenn sie DIESELBE SPRACHE traegt und
// entweder dieselbe Kennung oder denselben Dateinamen hat.
//
// Die Sprache gehoert dazu (Durchgang 18, Befund 1): Die TCGdex-Kennung unterscheidet sie
// NICHT - sv03.5-006 ist die deutsche wie die englische Glurak-ex, nur Name und Bild
// unterscheiden sich. Der Kommentar, der hier bis zum 18.09.2026 stand ("dieselbe Karte in
// zwei Sprachen hat zwei Kennungen"), war falsch, und die Folge war, dass die zweite
// Sprache derselben Karte sich gar nicht anlegen liess: Sie bekam "Exemplar hinzufuegen"
// auf die Notiz der ERSTEN Sprache - mit deren Preis und deren Bild. Das Datenmodell sieht
// je Sprache eine eigene Notiz vor (Fachpruefung 16.09.2026, siehe seite-karte.js).
// Traegt eine Notiz gar keine Sprache, gilt sie als Treffer: unbekannt ist kein Freibrief.
//
// Der Dateiname gehoert dazu (Durchgang 18, Befund 4): Eine von Hand angelegte Karte
// ("Ohne Suche anlegen") hat keine Kennung. Ueber die Kennung allein war sie unsichtbar,
// und dieselbe Karte liess sich ein zweites Mal anlegen - stillschweigend, die Datei hiess
// dann " (2)" und die Karte zaehlte in jeder Summe doppelt.
window.ksKarteVorhanden = (felder) => {
  const f = (felder && typeof felder === "object") ? felder : { tcgdex: felder };
  const id = String(f.tcgdex ?? "");
  const sprache = String(f.sprache ?? "").trim().toLowerCase();
  const name = f.name != null ? window.ksKartenDateiname(f) : "";
  // Zwei Schreibweisen desselben Namens (Durchgang 19, Befund 1): die alte ohne Sprache
  // ("Pikachu 173-165 151") und die neue mit ("Pikachu 173-165 151 Englisch"). Verglichen
  // wird gegen beide - sonst faende die Pruefung genau die Notizen nicht mehr, die vor der
  // Umstellung angelegt wurden, und Befund 4 aus Durchgang 18 waere wieder offen.
  const nameSpr = f.name != null ? window.ksKartenDateiname(f, true) : "";
  if (!id && !name) return null;
  for (const d of app.vault.getMarkdownFiles()) {
    if (!d.path.startsWith("Karten/")) continue;
    const fm = app.metadataCache.getFileCache(d)?.frontmatter ?? {};
    const dsp = String(fm.sprache ?? "").trim().toLowerCase();
    if (dsp && sprache && dsp !== sprache) continue;
    if (id && String(fm.tcgdex ?? "") === id) return d;
    if (name && (d.basename === name || d.basename === nameSpr)) return d;
  }
  return null;
};

// Dateiname nach der Konvention der Sammlung: "Name Nummer-Gesamt Set", also
// "Glurak-ex 183-165 151". Zeichen, die Obsidian in Dateinamen oder Links nicht
// vertraegt, fallen weg - Apostrophe ebenso ("N's Reshiram" liegt als "Ns Reshiram").
//
// Mit `mitSprache` haengt die Sprache hinten an ("Pikachu 173-165 151 Englisch"). Gebraucht
// wird das, wo zwei Ausgaben derselben Karte denselben Namen ergeben (Durchgang 19, Befund 1):
// "Pikachu" heisst auf Deutsch wie auf Englisch Pikachu, und die zweite Notiz hiess deshalb
// " (2)" - genau die Markierung, mit der die Inbox das versehentliche Doppel bezeichnet.
// Ohne das Flag bleibt der Name unveraendert: Die vorhandenen Notizen tragen keine Sprache
// im Namen, und die Konvention in CLAUDE.md lautet weiter "Name Nummer-Gesamt Set".
window.ksKartenDateiname = (f, mitSprache) => {
  const teile = [f.name, String(f.nummer ?? "").replace("/", "-"), f.set, mitSprache ? f.sprache : null]
    .map((t) => String(t ?? "").replace(/['"*\\/<>:|?#^\[\]]/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return teile.join(" ") || "Karte";
};

// Dataview kennt eine neue Datei erst nach seinem naechsten Lauf. Wer sie sofort oeffnet,
// bekommt in seite-karte.js ein leeres dv.current() und eine tote Seite. Darum warten,
// bis der Index sie hat - hoechstens drei Sekunden, dann wird trotzdem geoeffnet.
const ksWartenAufIndex = (pfad) => new Promise((fertig) => {
  const uhr = setTimeout(() => { app.metadataCache.offref(ref); fertig(); }, 3000);
  const ref = app.metadataCache.on("dataview:metadata-change", (_art, datei) => {
    if (datei?.path !== pfad) return;
    clearTimeout(uhr); app.metadataCache.offref(ref); fertig();
  });
});

// Legt die Notiz aus Vorlagen/Karte.md an und schreibt die Felder ueber Obsidians eigenen
// Kopfblock-Schreiber - der maskiert Anfuehrungszeichen und Doppelpunkte selbst (Fehler-
// muster 10: ein von Hand gebauter Kopfblock mit doppeltem Schluessel loescht alle Felder).
// Ueberschreibt nie: Ist der Name vergeben, kommt zuerst die SPRACHE in den Namen, und
// erst wenn auch der belegt ist, " (2)" wie in der Inbox (Durchgang 19, Befund 1).
window.ksKarteAnlegen = async (felder) => {
  const vorlage = app.vault.getAbstractFileByPath("Vorlagen/Karte.md");
  if (!vorlage) throw new Error("Die Vorlage Vorlagen/Karte.md fehlt - ohne sie kann keine Karte angelegt werden.");
  const text = await app.vault.read(vorlage);
  const basis = window.ksKartenDateiname(felder);
  // Ist der Name vergeben, ist es NICHT dieselbe Karte: Die Doppelpruefung (ksKarteVorhanden,
  // ueber Sprache und Kennung oder Dateiname) lief unmittelbar davor und war sauber. Es ist
  // die zweite AUSGABE derselben Karte - "Pikachu 173/165 151" heisst auf Deutsch wie auf
  // Englisch so. Die bekommt ihre Sprache in den Namen; " (2)" bleibt, was es war: die
  // Notmarke fuer das unerklaerte Doppel (Durchgang 19, Befund 1).
  let pfad = `Karten/${basis}.md`;
  if (app.vault.getAbstractFileByPath(pfad)) {
    const mitSprache = window.ksKartenDateiname(felder, true);
    let n = 2;
    pfad = `Karten/${mitSprache}.md`;
    while (app.vault.getAbstractFileByPath(pfad)) pfad = `Karten/${mitSprache} (${n++}).md`;
  }
  const datei = await app.vault.create(pfad, text);
  await app.fileManager.processFrontMatter(datei, (fm) => {
    for (const [k, v] of Object.entries(felder)) if (v !== "" && v != null) fm[k] = v;
  });
  // Die Namenslisten des Werbemodus sind je Sitzung gemerkt - eine neue Karte muss hinein,
  // sonst bekommt sie keinen erfundenen Namen und kein Platzhalterbild.
  ksNamenNummern = null; ksSetNummern = null;
  await ksWartenAufIndex(pfad);
  return datei;
};

// Die Sprache einer Notiz gegen die Sprache der Treffer. Leerer String heisst: passt.
//
// Die Regel (Durchgang 19, Befund 2): Eine Notiz traegt genau die Sprache, aus der ihre
// Kennung, ihr Bild und ihr Preis stammen. Sie steht seit dem 16.09.2026 in der Karten-
// Ansicht (seite-karte.js: "Sprache ist ANZEIGE, sobald sie einmal gesetzt ist"), hat aber
// im Verknuepfen-Formular gefehlt: Wer dort die Sprache umstellte - der naheliegende
// Handgriff, wenn die deutsche Suche nichts findet -, bekam englisches Bild und englische
// Seltenheit in eine Notiz, deren Sprachfeld auf Deutsch stehenblieb. Genau die Karte, die
// sich selbst widerspricht. Halb ist keine Antwort: Wo beides auseinanderfaellt, wird
// verweigert. Wer die andere Ausgabe besitzt, legt eine eigene Notiz an.
// Traegt die Notiz noch gar keine Sprache, gibt es nichts zu widersprechen - dann wird sie
// beim Verknuepfen erstmals gesetzt, wie jedes andere leere Feld.
window.ksSprachKonflikt = (datei, felder) => {
  const eigen = String(app.metadataCache.getFileCache(datei)?.frontmatter?.sprache ?? "").trim();
  const neu = String(felder?.sprache ?? "").trim();
  if (!eigen || !neu || eigen.toLowerCase() === neu.toLowerCase()) return "";
  return `Diese Karte ist auf ${eigen} angelegt, der Treffer stammt aus ${neu}. `
    + `Kennung, Bild und Preis müssen zur Sprache der Notiz passen - suche auf ${eigen}, `
    + `oder lege die ${neu.toLowerCase()}e Ausgabe als eigene Karte an.`;
};

// Eine vorhandene Notiz mit TCGdex-Daten nachfuellen (Karte ohne Kennung, von Hand
// angelegt). Was der Sammler selbst eingetragen hat, bleibt: Name, Set, Nummer und
// Sprache werden nur gesetzt, wo sie leer sind. Kennung, Bild und Preise kommen immer -
// darum steht die Sprachwache hier, am Schreibweg selbst, und nicht nur am Formular.
window.ksKarteVerknuepfen = async (datei, felder) => {
  const konflikt = window.ksSprachKonflikt(datei, felder);
  if (konflikt) throw new Error(konflikt);
  await app.fileManager.processFrontMatter(datei, (fm) => {
    const leer = (v) => v == null || String(v).trim() === "";
    for (const [k, v] of Object.entries(felder)) {
      if (v === "" || v == null) continue;
      if (["name", "set", "sprache", "name_original"].includes(k) && !leer(fm[k])) continue;
      // Eine Nummer ohne Set-Groesse ("183") wird durch die volle ersetzt ("183/165") -
      // erst daraus kennt die Set-Seite die Groesse.
      if (k === "nummer" && !leer(fm[k]) && String(fm[k]).includes("/")) continue;
      fm[k] = v;
    }
  });
  ksNamenNummern = null; ksSetNummern = null;
};

// Ein Exemplar anhaengen - eine Stelle fuer den Knopf in der Karten-Ansicht und fuer
// "Schon in der Sammlung - Exemplar hinzufuegen" in der Suche.
window.ksExemplarDazu = (datei) => app.fileManager.processFrontMatter(datei, (fm) => {
  window.ksExemplareUmstellen(fm);
  fm.exemplare.push({ zustand: "NM" });
  window.ksNeuesStueck = fm.exemplare.length - 1;
});

// Das Formular als HTML - eine Quelle fuer Album, Inbox und Karten-Ansicht.
//   modus "anlegen":     Suche plus "Ohne Suche anlegen"; jeder Treffer legt eine Notiz an.
//   modus "verknuepfen": auf einer Karte ohne Kennung; jeder Treffer fuellt DIESE Notiz.
// `vor` fuellt die Felder vor (Karten-Ansicht: Name, Nummer, Set, Sprache der Notiz).
// Im Werbemodus gibt es das Formular nicht: Es zeigt echte Kartennamen und die echten
// Set-Namen der Sammlung, und beides hat auf einem Werbebild nichts verloren.
window.ksNeuHtml = ({ modus = "anlegen", pfad = "", vor = {} } = {}) => {
  if (window.ksWerbemodus()) return "";
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const sets = new Set();
  for (const d of app.vault.getMarkdownFiles()) {
    if (!d.path.startsWith("Karten/")) continue;
    const s = app.metadataCache.getFileCache(d)?.frontmatter?.set;
    if (s != null && String(s).trim()) sets.add(String(s));
  }
  const sprachen = window.ksSprachen;
  const anlegen = modus === "anlegen";
  // Im Modus "verknuepfen" gehoert die Sprache der Notiz, nicht der Suche (Durchgang 19,
  // Befund 2). Sobald die Notiz eine hat, steht das Feld fest und zeigt genau sie - auch
  // eine, die nicht in der Liste steht. Dieselbe Regel wie zwei Kacheln daneben in der
  // Karten-Ansicht: gesetzte Sprache ist Anzeige, keine Auswahl.
  const fest = !anlegen && String(vor.sprache ?? "").trim() ? String(vor.sprache).trim() : "";
  const auswahl = fest ? [fest] : sprachen;
  const gewaehlt = fest || (sprachen.includes(String(vor.sprache)) ? String(vor.sprache) : "Deutsch");
  return `<div class="ks-flaeche ks-neu" data-neu-modus="${modus}" data-neu-pfad="${esc(pfad)}" hidden>
    <div class="ks-flaeche__kopf">
      <span class="ks-flaeche__titel">${anlegen ? "Karte anlegen" : "Kennung suchen"}</span>
      <span class="ks-kopf__label">${anlegen ? "Name und Nummer wie auf der Karte" : "füllt diese Karte mit Set, Bild und Preisen"}</span>
    </div>
    <div class="ks-neu__felder">
      <label class="ks-neu__feld"><span>Name</span>
        <input class="ks-feld ks-feld--klein" type="text" data-neu-feld="name" value="${esc(vor.name)}" placeholder="Glurak-ex" autocomplete="off"></label>
      <label class="ks-neu__feld ks-neu__feld--schmal"><span>Nummer</span>
        <input class="ks-feld ks-feld--klein" type="text" data-neu-feld="nummer" value="${esc(vor.nummer)}" placeholder="183/165" autocomplete="off"></label>
      <label class="ks-neu__feld"><span>Set</span>
        <input class="ks-feld ks-feld--klein" type="text" data-neu-feld="set" value="${esc(vor.set)}" list="ks-neu-sets" placeholder="${anlegen ? "grenzt die Suche ein" : "frei lassen"}" autocomplete="off">
        <datalist id="ks-neu-sets">${[...sets].sort().map((s) => `<option value="${esc(s)}">`).join("")}</datalist></label>
      <label class="ks-neu__feld ks-neu__feld--schmal"><span>Sprache</span>
        <select class="ks-feld ks-feld--klein" data-neu-feld="sprache"${fest ? ` disabled title="Diese Karte ist auf ${esc(fest)} angelegt. Kennung, Bild und Preis müssen zu ihrer Sprache passen."` : ""}>
          ${auswahl.map((s) => `<option value="${esc(s)}"${s === gewaehlt ? " selected" : ""}>${esc(s)}</option>`).join("")}
        </select></label>
    </div>
    <div class="ks-neu__aktionen">
      <button type="button" class="ks-knopf" data-neu="suchen">Bei TCGdex suchen</button>
      ${anlegen ? `<button type="button" class="ks-knopf ks-knopf--leise" data-neu="ohne">Ohne Suche anlegen</button>` : ""}
      <span class="ks-neu__hinweis"></span>
    </div>
    <div class="ks-neu__treffer"></div>
  </div>`;
};

// Trefferliste als HTML. Karten, die es schon gibt, bekommen keinen "Anlegen"-Knopf,
// sondern "Oeffnen" und "Exemplar hinzufuegen" - genau der Fehler, der im Demo 785,70 €
// Differenz erzeugt hat (dieselbe Karte zweimal angelegt), ist damit nicht mehr moeglich.
const ksNeuTrefferHtml = (treffer, gesamt, modus, sprache) => {
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  // Kein Text nennt einen Knopf, den es in diesem Modus nicht gibt (Durchgang 18,
  // Befund 7): "Ohne Suche anlegen" rendert ksNeuHtml nur im Modus "anlegen".
  if (!treffer.length) return `<div class="ks-karte__leer">Nichts gefunden. Prüfe Name, Nummer und Sprache${modus === "anlegen" ? " - oder lege die Karte ohne Suche an." : "."}</div>`;
  const zeilen = treffer.map((k) => {
    const f = window.ksTcgdexFelder(k, sprache);
    const da = window.ksKarteVorhanden(f);
    const meta = [f.set, f.nummer, f.seltenheit, f.preis != null ? window.ksGeld(f.preis, true, { roh: true }) : null]
      .filter((x) => x != null && x !== "").map(esc).join(" · ");
    const knopf = da
      ? `<span class="ks-neu__da">schon in der Sammlung</span>
         <a class="ks-knopf ks-knopf--leise" href="#" data-ziel="${esc(da.path)}">Öffnen</a>
         <a class="ks-knopf" href="#" data-neu="exemplar" data-pfad="${esc(da.path)}">Exemplar hinzufügen</a>`
      : modus === "verknuepfen"
        ? `<a class="ks-knopf" href="#" data-neu="verknuepfen" data-id="${esc(k.id)}">Verknüpfen</a>`
        : `<a class="ks-knopf" href="#" data-neu="anlegen" data-id="${esc(k.id)}">Anlegen</a>`;
    return `<div class="ks-neu__treffer-zeile">
      <!-- kein loading="lazy": bei nachtraeglich eingefuegten Bildern startet der Rahmen das
           Laden nie (gemessen 18.09.2026: currentSrc leer, complete false; mit eager 245 px) -->
      ${k.image ? `<img class="ks-neu__bild" src="${esc(k.image)}/low.webp" alt="">` : `<span class="ks-neu__bild"></span>`}
      <span class="ks-neu__text"><span class="ks-neu__name">${esc(f.name)}${f.name_original ? ` <span class="ks-neu__orig">${esc(f.name_original)}</span>` : ""}</span>
        <span class="ks-neu__meta">${meta}</span></span>
      <span class="ks-neu__knoepfe">${knopf}</span>
    </div>`;
  }).join("");
  const mehr = gesamt > treffer.length
    ? `<div class="ks-neu__mehr">${gesamt} Treffer, gezeigt werden ${treffer.length}. Gib die Nummer oder das Set dazu.</div>` : "";
  return zeilen + mehr;
};

// Knopf "Karte anlegen" - eine Quelle fuer Album und Inbox, im Werbemodus keiner (wie das
// Formular selbst).
window.ksNeuKnopfHtml = (text = "Karte anlegen") => window.ksWerbemodus() ? ""
  : `<button type="button" class="ks-knopf" data-neu="auf">${text}</button>`;

// Alles, was im Formular geklickt wird. Wird vom Klick-Handler in ksRahmen gerufen.
// Schreibende Schritte auf VORHANDENE Notizen laufen ueber ksNacheinander wie jeder
// andere Schreibvorgang; das Anlegen einer neuen Datei nicht - es gibt dort keine
// Reihenfolge zu wahren, und der Doppelklick-Schutz ist die Sperre am Formular.
const ksNeuKlick = async (el, dok, rahmen) => {
  const was = el.dataset.neu;
  const box = dok.querySelector(".ks-neu");
  const blatt = () => app.workspace.getLeavesOfType("markdown").find((l) => l.view?.containerEl?.contains(rahmen));
  if (was === "auf") {
    if (!box) return;
    box.hidden = !box.hidden;
    if (!box.hidden) { box.scrollIntoView({ block: "nearest", behavior: "smooth" }); box.querySelector('[data-neu-feld="name"]')?.focus(); }
    return;
  }
  if (!box) return;
  // Die Sperre gilt im JavaScript, nicht nur im CSS (Durchgang 18, Befund 2):
  // .ks-neu--laeuft sperrt mit pointer-events:none, und das haelt nur den Mauszeiger ab.
  // Enter und jeder andere programmatische .click() liefen glatt hindurch - dreimal Enter
  // hintereinander startete drei Abrufserien, und die zuletzt eintreffende Antwort
  // ueberschrieb die Liste, notfalls mit der Antwort auf eine laengst geaenderte Frage.
  // Hier ist der eine Weg, durch den JEDER Klick des Formulars laeuft.
  if (box.classList.contains("ks-neu--laeuft")) return;
  const wert = (n) => String(box.querySelector(`[data-neu-feld="${n}"]`)?.value ?? "").trim();
  const hinweis = box.querySelector(".ks-neu__hinweis");
  const treffer = box.querySelector(".ks-neu__treffer");
  const eingabe = { name: wert("name"), nummer: wert("nummer"), set: wert("set"), sprache: wert("sprache") };
  const modus = box.dataset.neuModus, pfad = box.dataset.neuPfad;
  const sagen = (t, fehler) => { hinweis.textContent = t; hinweis.classList.toggle("ks-neu__hinweis--fehler", !!fehler); };
  const sperren = (an) => box.classList.toggle("ks-neu--laeuft", an);

  if (was === "suchen") {
    if (!eingabe.name && !eingabe.nummer) { sagen("Gib einen Namen oder eine Nummer ein.", true); return; }
    // Auch hier nennt der Hinweis nur, was dieser Modus anbietet (Durchgang 18, Befund 7).
    if (!window.ksTcgdexSprachen[eingabe.sprache]) {
      sagen(`Für ${eingabe.sprache} hat TCGdex keine Daten - ${modus === "anlegen"
        ? "lege die Karte ohne Suche an" : "diese Karte lässt sich nicht verknüpfen"}.`, true);
      return;
    }
    sperren(true); sagen("Suche läuft …"); treffer.innerHTML = "";
    try {
      const { treffer: liste, gesamt } = await window.ksTcgdexSuche(eingabe);
      window.ksNeuTreffer = new Map(liste.map((k) => [k.id, k]));
      treffer.innerHTML = ksNeuTrefferHtml(liste, gesamt, modus, eingabe.sprache);
      sagen(liste.length ? `${liste.length} Treffer` : "");
    } catch (err) {
      console.error("ks: TCGdex-Suche", err);
      sagen(window.ksFehlerText(err, "Die Suche ist fehlgeschlagen. Der Grund steht in der Konsole."), true);
    } finally { sperren(false); }
    return;
  }

  if (was === "ohne" || was === "anlegen") {
    let felder;
    if (was === "ohne") {
      if (!eingabe.name) { sagen("Ohne Suche braucht die Karte mindestens einen Namen.", true); return; }
      felder = { name: eingabe.name, sprache: eingabe.sprache };
      if (eingabe.set) felder.set = eingabe.set;
      if (eingabe.nummer) felder.nummer = eingabe.nummer;
    } else {
      const k = window.ksNeuTreffer?.get(el.dataset.id);
      if (!k) { sagen("Bitte noch einmal suchen.", true); return; }
      felder = window.ksTcgdexFelder(k, eingabe.sprache);
    }
    // Doppelprüfung fuer BEIDE Wege (Durchgang 18, Befund 4): Sie hing vorher nur am
    // "Anlegen"-Knopf und nur an der Kennung. "Ohne Suche anlegen" lief ganz daran vorbei
    // und legte dieselbe Karte ein zweites Mal an - die Datei hiess dann " (2)", und
    // niemand erfuhr davon. Gemeldet wird in jedem Fall; die vorhandene Notiz geht auf.
    const da = window.ksKarteVorhanden(felder);
    if (da) {
      new Notice("Diese Karte gibt es schon - hier ist sie. Für ein weiteres Exemplar den Knopf „Exemplar hinzufügen“ nehmen.");
      await app.workspace.getLeaf(false).openFile(da);
      return;
    }
    sperren(true); sagen("Karte wird angelegt …");
    try {
      const datei = await window.ksKarteAnlegen(felder);
      new Notice(`Karte angelegt: ${felder.name}`);
      await app.workspace.getLeaf(false).openFile(datei);
    } catch (err) {
      console.error("ks: Karte anlegen", err);
      const text = window.ksFehlerText(err, "Die Karte konnte nicht angelegt werden. Der Grund steht in der Konsole.");
      new Notice(text);
      sagen(text, true); sperren(false);
    }
    return;
  }

  if (was === "verknuepfen") {
    const k = window.ksNeuTreffer?.get(el.dataset.id);
    const datei = app.vault.getAbstractFileByPath(pfad);
    if (!k || !datei) { sagen("Bitte noch einmal suchen.", true); return; }
    const da = window.ksKarteVorhanden(window.ksTcgdexFelder(k, eingabe.sprache));
    if (da && da.path !== datei.path) { new Notice("Diese Karte gibt es in dieser Sprache schon."); await app.workspace.getLeaf(false).openFile(da); return; }
    // Dieselbe Wache wie im Schreibweg, nur hier mit dem ausfuehrlichen Grund im Hinweis -
    // ksNacheinander wuerde den Fehler zu "Die Änderung konnte nicht gespeichert werden."
    // eindampfen. Erreichbar ist das nur programmatisch: Im Formular steht die Sprache im
    // Modus "verknuepfen" fest, sobald die Notiz eine hat (Durchgang 19, Befund 2).
    const konflikt = window.ksSprachKonflikt(datei, window.ksTcgdexFelder(k, eingabe.sprache));
    if (konflikt) { sagen(konflikt, true); return; }
    sperren(true);
    window.ksNacheinander(() => window.ksKarteVerknuepfen(datei, window.ksTcgdexFelder(k, eingabe.sprache)), (ok) => {
      if (ok) new Notice("Karte verknüpft: Kennung, Bild und Preise sind da.");
      blatt()?.rebuildView?.();
    });
    return;
  }

  if (was === "exemplar") {
    const datei = app.vault.getAbstractFileByPath(el.dataset.pfad);
    if (!datei) { new Notice("Diese Karte gibt es nicht mehr."); return; }
    sperren(true);
    window.ksNacheinander(() => window.ksExemplarDazu(datei), async (ok) => {
      if (!ok) { window.ksNeuesStueck = null; sperren(false); return; }
      new Notice("Exemplar hinzugefügt");
      await app.workspace.getLeaf(false).openFile(datei);
    });
  }
};

window.ksRahmen = async (dv, opt) => {
  const css = await dv.io.load("Skripte/oberflaeche.css") || "";

  const rahmen = dv.el("iframe", "");
  // rebuildView() hängt einen neuen Rahmen an, statt den alten zu ersetzen - ohne das
  // hier stand die Seite nach jeder Änderung doppelt da (gemeldet 15.09.2026).
  const behaelter = rahmen.parentElement;
  if (behaelter && rahmen.isConnected) {
    for (const alt of behaelter.querySelectorAll("iframe")) if (alt !== rahmen) alt.remove();
  }
  rahmen.className = "ks-rahmen";
  rahmen.style.cssText = `width:100%;height:${opt.hoehe || "84vh"};border:0;display:block;background:#131313`;
  rahmen.srcdoc = `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>${css}</style></head>`
    + `<body class="${opt.koerperklasse || ""}">${opt.html}</body></html>`;

  rahmen.addEventListener("load", () => {
    const dok = rahmen.contentDocument;
    if (!dok) { console.error("ks: kein Zugriff auf den Rahmen"); return; }

    // Tab, Kopfzeile und Fenstertitel tragen den DATEINAMEN - im Werbemodus muss auch der
    // ersetzt werden, sonst steht auf jedem Screenshot die echte Karte über der Seite.
    {
      const blatt = app.workspace.getLeavesOfType("markdown")
        .find((l) => l.view.containerEl.contains(rahmen));
      window.ksTitelUeberschreiben?.(blatt, opt.karte);
    }

    // "Gespeichert" dort zeigen, wo eben geändert wurde. Es gibt ZWEI Bauformen: die
    // Sprache sitzt in einer .ks-karte__kachel, alle Exemplar-Felder in einer .ks-stueck-Zeile.
    // Bis zum 15.09.2026 abends wurde nur die Kachel gesucht - sieben von acht Feldern
    // meldeten gar nichts, und die achte hatte kein .ks-karte__detail, in das der Haken
    // gepasst hätte. Darum hängt die Marke jetzt am Behaelter selbst: eine Bauform, die
    // in beiden Faellen gleich aussieht und keinen vorhandenen Text überschreibt.
    const gespeichert = window.ksSpeicherMerker;
    window.ksSpeicherMerker = null;
    if (gespeichert && gespeichert.pfad === app.workspace.getActiveFile()?.path) {
      // Die Nummer muss mitgesucht werden, sonst leuchtet bei drei Exemplaren immer das erste
      const f = dok.querySelector(`[data-feld="${gespeichert.feld}"]`
        + (gespeichert.nr === undefined ? "" : `[data-nr="${gespeichert.nr}"]`));
      const box = f && f.closest(".ks-karte__kachel, .ks-stueck");
      if (box) {
        const zustand = box.classList.contains("ks-stueck")
          ? "ks-stueck--gespeichert" : "ks-karte__kachel--gespeichert";
        const marke = dok.createElement("span");
        marke.className = "ks-gespeichert";
        marke.textContent = "Gespeichert";
        box.classList.add(zustand);
        box.appendChild(marke);
        setTimeout(() => { box.classList.remove(zustand); marke.remove(); }, 1800);
      }
    }

    // Ein frisch angelegtes Exemplar in den Blick holen und kurz hervorheben. Ohne das
    // hängt die neue Zeile unten an der Liste, während der Knopf oben steht - es sieht
    // aus, als wäre nichts passiert (gemeldet 15.09.2026).
    const neuesStueck = window.ksNeuesStueck;
    window.ksNeuesStueck = null;
    if (neuesStueck != null) {
      requestAnimationFrame(() => {
        const zeilen = dok.querySelectorAll(".ks-stueck");
        const zeile = zeilen[neuesStueck] || zeilen[zeilen.length - 1];
        if (!zeile) return;
        zeile.scrollIntoView({ block: "center", behavior: "smooth" });
        zeile.classList.add("ks-stueck--neu");
        setTimeout(() => zeile.classList.remove("ks-stueck--neu"), 1200);
      });
    }

    // Scrollposition zurueckholen, wenn dieser Rahmen nach einer Feldaenderung neu entsteht
    const merker = window.ksScrollMerker;
    window.ksScrollMerker = null;            // immer verbrauchen, auch wenn er nicht passt
    if (merker && merker.pfad === app.workspace.getActiveFile()?.path) {
      dok.body.scrollTop = merker.y;
      // Bilder laden nach, die Höhe wächst noch - darum ein zweites Mal im nächsten Bild
      requestAnimationFrame(() => { dok.body.scrollTop = merker.y; });
    }

    // Werbemodus umschalten. Steht als eigene Funktion da, weil zwei Wege hierher
    // fuehren: der Schalter in der Navi und die Escape-Taste (18.09.2026).
    const werbemodusUmschalten = async () => {
      const an = window.ksWerbemodus();
      // Einschalten ohne Platzhalterbilder waere eine Falle: Namen, Sets und Kennungen
      // waeren erfunden, die Illustrationen echt. Darum hier die Bremse statt eines
      // stillen Rueckfalls (gemeldet 16.09.2026).
      if (!an && !window.ksPlatzhalterBilder().length) {
        new Notice("Der Werbemodus braucht eigene Bilder: Lege sie als PNG oder JPG in den Ordner Fotos/Platzhalter. Ohne sie blieben die echten Kartenbilder stehen.");
        return;
      }
      const datei = app.vault.getAbstractFileByPath("Dashboard.md");
      if (!datei) { new Notice("Das Dashboard fehlt - ohne es lässt sich der Werbemodus nicht umschalten."); return; }
      await app.fileManager.processFrontMatter(datei, (f) => {
        if (an) delete f.bilder; else f.bilder = "platzhalter";
      });
      new Notice(an ? "Werbemodus aus" : "Werbemodus an");
      // kurz warten, bis Obsidians Kopfblock-Speicher den neuen Wert kennt
      await new Promise((r) => setTimeout(r, 120));
      const blatt = app.workspace.getLeavesOfType("markdown")
        .find((l) => l.view.containerEl.contains(rahmen));
      if (blatt) blatt.rebuildView();
    };

    // Klicks: Navigation, Ordner, Befehle
    dok.addEventListener("click", async (e) => {
      // Werbemodus umschalten: Wert in den Kopfblock von Dashboard.md schreiben und die
      // Ansicht neu aufbauen. Der Schalter sitzt in der Navi und wirkt auf allen Seiten.
      const schalter = e.target.closest("[data-schalter='werbung']");
      if (schalter) { e.preventDefault(); await werbemodusUmschalten(); return; }
      const ziel = e.target.closest("a[data-ziel]");
      if (ziel) {
        e.preventDefault();
        await app.workspace.getLeaf(false).openFile(app.vault.getAbstractFileByPath(ziel.dataset.ziel)
          || app.metadataCache.getFirstLinkpathDest(ziel.dataset.ziel, ""));
        return;
      }
      // Exemplar hinzufuegen oder entfernen
      const ex = e.target.closest("[data-exemplar]");
      if (ex) {
        e.preventDefault();
        const datei = app.vault.getAbstractFileByPath(ex.dataset.pfad);
        if (!datei) { new Notice("Diese Karte gibt es nicht mehr."); return; }
        const was = ex.dataset.exemplar, nr = Number(ex.dataset.nr);

        // Die ganze Karte aus der Sammlung nehmen (19.09.2026). Nur am LETZTEN Exemplar
        // angeboten - ein einzelnes zu loeschen ginge dort nicht, siehe seite-karte.js.
        //
        // ENDGUELTIG, kein Papierkorb (Marks Entscheidung 19.09.2026: "sobald ok dann
        // einfach loeschen und gut ist"). Der erste Bau legte die Notiz in den Papierkorb
        // und versprach im Dialog, sie liesse sich zurueckholen - welcher Papierkorb das
        // beim Kaeufer ist, haengt an dessen Obsidian-Einstellung, die Zusage war also
        // ungedeckt. Der Dialog sagt jetzt, was wirklich passiert.
        if (was === "karte-weg") {
          const name = datei.basename ?? datei.name;
          if (!(await window.ksFrage(dok, `„${name}" aus der Sammlung nehmen? Die Karte wird gelöscht.`))) return;
          window.ksNacheinander(() => app.vault.delete(datei), (ok) => {
            if (!ok) return;
            new Notice(`„${name}" ist gelöscht.`);
            // Die offene Ansicht zeigt sonst eine Notiz, die es nicht mehr gibt.
            const ziel = app.vault.getAbstractFileByPath("Album.md");
            if (ziel) app.workspace.getLeaf(false).openFile(ziel);
          });
          return;
        }

        if (was !== "dazu") window.ksScrollMerker = { pfad: ex.dataset.pfad, y: dok.body.scrollTop };
        // "dazu" laeuft ueber window.ksExemplarDazu - dieselbe Stelle, die auch die Suche
        // nutzt ("schon in der Sammlung - Exemplar hinzufuegen", 18.09.2026).
        window.ksNacheinander(() => was === "dazu" ? window.ksExemplarDazu(datei) : app.fileManager.processFrontMatter(datei, (fm) => {
          window.ksExemplareUmstellen(fm);
          // Beim Löschen zählt der Stand zum Zeitpunkt der Ausfuehrung, nicht der beim
          // Klick: wer dreimal auf dasselbe Kreuz klickt, erwartet drei weniger.
          if (was === "weg" && fm.exemplare.length > 1) {
            fm.exemplare.splice(Math.min(nr, fm.exemplare.length - 1), 1);
          }
        }), (ok) => {
          // Neu aufbauen auch nach einem Fehler, sonst bleibt der falsche Stand stehen -
          // nur die Hervorhebung des neuen Exemplars fällt weg, denn es gibt keins.
          if (!ok) window.ksNeuesStueck = null;
          const blatt = app.workspace.getLeavesOfType("markdown")
            .find((l) => l.view?.containerEl?.contains(rahmen));
          blatt?.rebuildView?.();
        });
        return;
      }

      // Leeren-Knopf neben einem Feld (18.09.2026, Marks Regel: alles Einstellbare muss sich
      // zuruecksetzen lassen). Leert das genannte Feld und schickt es ueber den normalen
      // change-Weg - der raeumt abhaengige Felder (das Verkaufsdatum) selbst mit.
      //
      // Gesucht wird in der naechsten UMGEBUNG, nicht nur im eigenen Label (19.09.2026):
      // Seit Verkaufspreis und Verkaufsdatum in einer gemeinsamen Klammer stehen, liegt der
      // Knopf neben den Labels statt darin - closest("label") fand dann nichts, und der
      // Knopf tat stillschweigend gar nichts.
      const leeren = e.target.closest("[data-leeren]");
      if (leeren) {
        e.preventDefault();
        const umgebung = leeren.closest(".ks-stueck__paar, label, .ks-stueck, .ks-karte__kachel");
        const feld = umgebung?.querySelector(`[data-feld="${leeren.dataset.leeren}"]`);
        if (feld) { feld.value = ""; feld.dispatchEvent(new dok.defaultView.Event("change", { bubbles: true })); }
        return;
      }
      // Stift (18.09.2026, Marks Wort "Stift"): Seltenheit, Set und Nummer waren nach dem
      // ersten Eintrag reine Anzeige - ein Tippfehler war ohne Quelltext nicht heilbar
      // (Fuer-Mark 29). Der Stift oeffnet das Feld wieder; gespeichert wird ueber den
      // normalen change-Weg. Die Sprache bleibt gesperrt (Entscheidung 16.09.2026).
      const stift = e.target.closest("[data-stift]");
      if (stift) {
        e.preventDefault();
        const ziel = dok.querySelector(`[data-stift-ziel="${stift.dataset.stift}"]`);
        if (!ziel) return;
        ziel.hidden = false;
        for (const a of dok.querySelectorAll(`[data-stift-anzeige="${stift.dataset.stift}"]`)) a.hidden = true;
        ziel.querySelector("input")?.focus();
        return;
      }
      // Karte anlegen / Kennung suchen (18.09.2026): Formular auf, Suche, Treffer
      const neu = e.target.closest("[data-neu]");
      if (neu) { e.preventDefault(); await ksNeuKlick(neu, dok, rahmen); return; }

      const ordner = e.target.closest("a[data-ordner]");
      if (ordner) {
        e.preventDefault();
        if (!["Fotos", "Inbox"].includes(ordner.dataset.ordner)) { new Notice("Dieser Link führt aus deiner Sammlung heraus und wurde nicht geöffnet."); return; }
        const ad = app.vault.adapter;
        const abs = ad.getFullPath ? ad.getFullPath(ordner.dataset.ordner) : `${ad.basePath}/${ordner.dataset.ordner}`;
        try { require("electron").shell.openPath(abs); }
        catch (err) { new Notice("Der Ordner ließ sich nicht öffnen: " + err.message); }
        return;
      }
      const befehl = e.target.closest("[data-befehl]");
      if (befehl && opt.befehl) { e.preventDefault(); opt.befehl(befehl.dataset.befehl, befehl, dok); }
    });

    // Eingaben: schreiben ins Frontmatter der Notiz, die im Feld steht
    dok.addEventListener("change", async (e) => {
      const feld = e.target.closest("[data-feld][data-pfad]");
      if (!feld) return;
      const datei = app.vault.getAbstractFileByPath(feld.dataset.pfad);
      // Ohne Dateipfad: Die Meldung ist fuer den Sammler, nicht fuer den Entwickler.
      if (!datei) { new Notice("Diese Karte gibt es nicht mehr."); return; }
      let wert = String(feld.value).trim();
      if (feld.dataset.art === "zahl") {
        wert = wert.replace(",", ".");
        if (wert !== "" && !isFinite(Number(wert))) { new Notice("Hier gehört eine Zahl hin, zum Beispiel 12,50."); return; }
        wert = wert === "" ? "" : Number(wert);
      }
      // Ein Datum wird geprueft wie eine Zahl. `verkauft` war bis 16.09.2026 das einzige
      // ungepruefte Feld, das etwas Hartes ausloest: Jeder Text darin nahm das Exemplar
      // aus dem Bestand und senkte den Gesamtwert, denn alle Leser pruefen nur "nicht leer".
      if (feld.dataset.art === "datum" && wert !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(wert)) {
        new Notice("Hier gehört ein Datum hin, zum Beispiel 11.09.2026."); return;
      }
      window.ksScrollMerker = { pfad: app.workspace.getActiveFile()?.path, y: dok.body.scrollTop };

      const nr = feld.dataset.nr;   // gesetzt: das Feld gehört zu einem Exemplar
      const ok = await window.ksNacheinander(() => app.fileManager.processFrontMatter(datei, (fm) => {
        if (nr === undefined) {
          if (wert === "") delete fm[feld.dataset.feld]; else fm[feld.dataset.feld] = wert;
          return;
        }
        window.ksExemplareUmstellen(fm);
        while (fm.exemplare.length <= Number(nr)) fm.exemplare.push({});
        const e = fm.exemplare[Number(nr)];
        if (wert !== "") { e[feld.dataset.feld] = wert; return; }
        delete e[feld.dataset.feld];
        // Ein Feld, das nur unter einer Bedingung sichtbar ist, verschwindet mit ihr -
        // sein Wert blieb bis 16.09.2026 in der Notiz stehen, unsichtbar und nicht mehr
        // loeschbar. Beim Verkaufspreis war das mehr als Ballast: Wer das Verkaufsdatum
        // loeschte und spaeter ein neues eintrug, hatte den ALTEN Preis wieder in der
        // Rechnung, ohne ihn getippt zu haben. Darum raeumt die Bedingung ihre Felder mit.
        for (const a of window.ksAbhaengigeFelder[feld.dataset.feld] ?? []) delete e[a];
        // Grading raus -> eigener Wert raus, wenn die Karte einen Marktpreis hat (Marks Wort
        // 18.09.2026: "sobald ich grading rausnehme bleibt die 600 noch ... komisch"). Der
        // Wert gehoerte zum Slab; ohne ihn gilt wieder Cardmarket. Ohne Marktpreis bleibt er,
        // sonst stuende dort "kein Preis". Bewusst nicht in ksAbhaengigeFelder: Die Sicht des
        // Felds haengt nicht nur am Grading (seite-karte.js), und die Regel ist bedingt.
        if (feld.dataset.feld === "grading" && fm.preis != null && fm.preis !== "") delete e.wert_manuell;
      }), (erfolg) => {
        // "Gespeichert" zeigt der NEUE Rahmen (Merker, siehe load-Handler) - im alten
        // wäre es nicht zu sehen, weil der Neuaufbau ihn sofort ersetzt. Nur nach einem
        // Fehlschlag bleibt der Merker leer: neu aufgebaut wird trotzdem, damit das Feld
        // wieder den Stand aus der Datei zeigt statt der abgelehnten Eingabe.
        if (erfolg) window.ksSpeicherMerker = { pfad: feld.dataset.pfad, feld: feld.dataset.feld, nr: feld.dataset.nr };
        const blatt = app.workspace.getLeavesOfType("markdown")
          .find((l) => l.view?.containerEl?.contains(rahmen));
        blatt?.rebuildView?.();
      });

      if (!ok) return;   // gescheitert: die Notice "Die Änderung konnte nicht gespeichert werden." steht schon
      // Die Meldung nennt die Beschriftung, die der Nutzer angeklickt hat ("Eigener Wert"),
      // nicht den Schluessel aus dem Kopfblock ("wert_manuell"). Sie wird DIREKT AM FELD
      // abgelesen statt aus einer zweiten Liste - sonst laeuft die Liste beim naechsten
      // neuen Feld auseinander (gemeldet 16.09.2026).
      const beschriftung = feld.closest("label")?.querySelector("span")?.textContent?.trim()
        || feld.closest(".ks-karte__kachel")?.querySelector(".ks-karte__label")?.textContent?.trim()
        || feld.dataset.feld;
      new Notice(wert === "" ? `${beschriftung} geleert` : `${beschriftung}: ${wert}`);
      if (opt.nachAenderung) opt.nachAenderung(feld, wert, dok);
    });

    // Enter beendet die Eingabe, statt etwas abzuschicken
    dok.addEventListener("keydown", (e) => {
      // Im Formular "Karte anlegen" startet Enter die Suche (18.09.2026) - ein Feld zu
      // verlassen waere dort die falsche Antwort auf die Taste. Aber NUR aus einem
      // Eingabefeld heraus (Durchgang 18, Befund 2): Vorher galt das fuer alles innerhalb
      // .ks-neu, also auch fuer die Knoepfe der Trefferliste - "Öffnen" mit der Tastatur
      // startete die Suche neu, statt die Karte zu oeffnen, und ohne Maus war die Liste
      // damit unbedienbar. Auf einem Knopf macht die Taste jetzt, was sie ueberall macht:
      // sie drueckt ihn.
      if (e.key === "Enter" && e.target.closest?.("[data-neu-feld]")) {
        e.preventDefault();
        e.target.closest(".ks-neu")?.querySelector('[data-neu="suchen"]')?.click();
        return;
      }
      if (e.key === "Enter" && e.target.matches("input")) { e.preventDefault(); e.target.blur(); }
      // Escape beendet den Werbemodus (18.09.2026, Marks Wort). Vorher war der einzige
      // Ausweg ein Klick auf die Ueberschrift "Sammlung" - die stand damit auf jedem
      // Werbebild, und niemand sah ihr an, dass sie ein Schalter ist. Mark selbst wusste
      // es nicht. Nicht waehrend einer Eingabe: Dort loescht Escape den Feldinhalt.
      if (e.key === "Escape" && window.ksWerbemodus() && !e.target.matches("input,textarea")) {
        e.preventDefault();
        werbemodusUmschalten();
      }
    });

    // Scrollbahn, die sich nur beim Scrollen zeigt (Entscheidung 15.09.2026). Eigenes Element
    // statt ::-webkit-scrollbar: der würde dauerhaft Breite wegnehmen, dieser liegt darüber.
    // Absolut statt fest, weil der Body scrollt - darum wird scrollTop in die Lage gerechnet.
    const bahn = dok.createElement("div");
    bahn.className = "ks-scrollbahn";
    dok.body.appendChild(bahn);
    let ruhe;
    const zeigen = () => {
      const b = dok.body, weg = b.scrollHeight - b.clientHeight;
      if (weg <= 0) { bahn.classList.remove("ks-scrollbahn--an"); return; }
      const hoch = Math.max(40, b.clientHeight / b.scrollHeight * b.clientHeight);
      bahn.style.height = hoch + "px";
      // ohne scrollTop: die Bahn hängt am Dokument, nicht am scrollenden Body -
      // sie wandert also von selbst nicht mit und wird direkt im Sichtfeld gesetzt
      bahn.style.top = (b.scrollTop / weg * (b.clientHeight - hoch)) + "px";
      bahn.classList.add("ks-scrollbahn--an");
      clearTimeout(ruhe);
      ruhe = setTimeout(() => bahn.classList.remove("ks-scrollbahn--an"), 700);
    };
    dok.body.addEventListener("scroll", zeigen, { passive: true });

    if (opt.fertig) opt.fertig(dok, rahmen);
  });

  return rahmen;
};

// Navigation als HTML – eine Quelle für alle Seiten
// Obsidian zeigt den DATEINAMEN im Tab, in der Kopfzeile und im Titel über der Notiz -
// dort steht weiter "Mew-ex 232-91 Paldeas Schicksale", egal was die Seite rendert. Im
// Werbemodus wird das ueberschrieben: nur die Anzeige, die Datei behält ihren Namen.
// Ohne das schließt der Screenshot trotz allem auf die echte Karte.
window.ksTitelUeberschreiben = (blatt, karte) => {
  if (!blatt) return;
  const echt = blatt.view?.file?.basename ?? "";
  const anzeige = window.ksWerbemodus() && karte
    ? `${window.ksKartenName(karte) ?? echt} ${String(karte.nummer ?? "").replace("/", "-")} ${window.ksSetName(karte) ?? ""}`.trim()
    : echt;
  const setzen = (el) => { if (el && el.textContent !== anzeige) el.textContent = anzeige; };
  setzen(blatt.tabHeaderInnerTitleEl);
  setzen(blatt.view?.containerEl?.querySelector(".view-header-title"));
  // Brotkrumen-Zeile: letzter Abschnitt ist der Dateiname
  const krume = blatt.view?.containerEl?.querySelector(".view-header-title-parent");
  if (krume && window.ksWerbemodus()) krume.style.display = "none";
  else if (krume) krume.style.display = "";
  // Fenstertitel (Obsidian setzt ihn aus dem Dateinamen nach)
  if (window.ksWerbemodus() && document.title.includes(echt) && echt) {
    document.title = document.title.replace(echt, anzeige);
  }
};

window.ksNaviHtml = (aktiv) => {
  const I = (d) => `<svg class="ks-navi__icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const punkte = [
    // "Start" steht ganz oben, weil ein neuer Vault sonst mit einem leeren Dashboard
    // beginnt (19.09.2026, Marks Freigabe). Wer seine Sammlung schon hat, klickt daran
    // vorbei - die Seite zeigt dann nur noch den Stand der drei Schritte.
    ["Start.md", "Start", `<path d="M5 12l-2 0l9 -9l9 9l-2 0"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/>`],
    ["Dashboard.md", "Dashboard", `<path d="M5 4h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1"/><path d="M5 16h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1"/><path d="M15 12h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1"/><path d="M15 4h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1"/>`],
    ["Album.md", "Album", `<path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"/><path d="M4 12h16"/><path d="M9 4v16"/><path d="M15 4v16"/>`],
    ["Sets.md", "Sets", `<path d="M4 4m0 2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2z"/><path d="M4 16m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z"/><path d="M16 4l4 0"/><path d="M16 8l4 0"/><path d="M16 12l4 0"/><path d="M16 16l4 0"/><path d="M16 20l4 0"/>`],
    ["Erfolge.md", "Erfolge", `<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10"/><path d="M17 4v8a5 5 0 0 1 -10 0v-8"/><path d="M5 9a2 2 0 0 1 0 -4h2"/><path d="M19 9a2 2 0 0 0 0 -4h-2"/>`],
    ["Inbox.md", "Inbox", `<path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12"/><path d="M4 13h3l3 3h4l3 -3h3"/>`],
  ];
  const extra = [
    ["__ordner:Fotos", "Fotos", `<path d="M15 8h.01"/><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"/><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"/><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"/>`],
    ["_Werkstatt/README.md", "Werkstatt", `<path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5"/>`],
    ["CLAUDE.md", "Regeln", `<path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"/><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"/><path d="M9 12l.01 0"/><path d="M13 12l2 0"/><path d="M9 16l.01 0"/><path d="M13 16l2 0"/>`],
  ];
  // "Über" steht NICHT bei Fotos, Werkstatt und Regeln, obwohl es dieselbe Ecke der Navi
  // teilt: Die drei sind Werkzeug des Besitzers, "Über" gehoert zum Produkt selbst -
  // Fassung, Herkunft der Preise, Update-Weg, Adresse fuer Fehler. Darum bleibt es auch im
  // Werbemodus stehen (Marks Wort 19.09.2026: "Über muss auch in den werbemodus rein"),
  // waehrend die drei anderen verschwinden.
  const ueber = ["Über.md", "Über", `<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 9h.01"/><path d="M11 12h1v4h1"/>`];
  const link = ([ziel, text, icon]) => ziel.startsWith("__ordner:")
    ? `<a href="#" class="ks-navi__punkt" data-ordner="${ziel.slice(9)}">${I(icon)}<span>${text}</span></a>`
    : `<a href="#" class="ks-navi__punkt${ziel === aktiv ? " ks-navi__punkt--aktiv" : ""}" data-ziel="${ziel}">${I(icon)}<span>${text}</span></a>`;
  // Schalter für den Werbemodus: schreibt `bilder` in den Kopfblock von Dashboard.md und
  // baut die Ansicht neu auf. Er steht in der Navi, damit er von jeder Seite aus erreichbar
  // ist - sonst müsste man zum Umschalten erst aufs Dashboard.
  const an = window.ksWerbemodus();
  const schalter = `<button type="button" class="ks-navi__punkt ks-navi__schalter${an ? " ks-navi__schalter--an" : ""}" data-schalter="werbung"
      title="Ersetzt Kartenbilder, Namen und Sets durch eigene - für Screenshots und Werbung">
    ${I(`<path d="M15 8h.01"/><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"/><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"/>`)}
    <span>Werbemodus</span>
    <span class="ks-navi__leuchte" aria-hidden="true"></span>
  </button>`;
  // Im Werbemodus bleibt nur die Sammlung stehen - Fotos, Werkstatt, Regeln und der Schalter
  // selbst gehoeren auf kein Werbefoto. Zurueck geht es seit 18.09.2026 mit der
  // Escape-Taste; vorher war es ein Klick auf die Ueberschrift "Sammlung". Die stand
  // damit auf jedem Werbebild, und niemand sah ihr an, dass sie ein Schalter ist - Marks
  // Wort: "wusste nich dass man es klicken kann". Ein Bedienelement, das nicht einmal
  // sein Erbauer erkennt, ist keins. Die Ueberschrift ist deshalb ganz entfallen: Die
  // Punkte darunter erklaeren sich selbst, und auf dem Bild steht nun nichts Ueberfluessiges.
  // Sie ist in BEIDEN Modi entfallen (Marks Wort: "mach sammlung weg"): Eine Ueberschrift
  // "Sammlung" ueber Dashboard, Album, Sets und Erfolgen benennt nicht, was darunter steht -
  // das sind Ansichten. Die Gruppe "System" unten bleibt, sie trennt wirklich etwas ab.
  // Steht der Werbemodus an, ohne dass es Platzhalterbilder gibt, sagt die Navi das auf
  // JEDER Seite - sonst stuenden erfundene Namen ueber leeren Bildflaechen und niemand
  // wuesste warum (gemeldet 16.09.2026). Der Hinweis nennt den Ordner und den Ausweg.
  const warnung = window.ksPlatzhalterFehlt()
    ? `<div class="ks-navi__warnung">Keine eigenen Bilder gefunden. Der Werbemodus zeigt darum keine Kartenbilder - lege PNG- oder JPG-Dateien in den Ordner Fotos/Platzhalter, oder beende den Werbemodus mit der Escape-Taste.</div>`
    : "";
  // Die Fassung, ganz unten in der Navi (Marks Wort 19.09.2026: "mach es auch als navi punkt
  // in der navi"). Sie beantwortet die Frage, die es ohne eigene App sonst nicht zu
  // beantworten gibt: Welchen Stand hat der Kaeufer? Ohne sie kann niemand sagen "du hast
  // eine alte Fassung" - weder er noch die Hilfe. Im Werbemodus bleibt sie weg, sie gehoert
  // auf kein Werbebild.
  // Die Zeile fuehrt auf dieselbe Seite wie der Punkt "Über" - wer die Nummer liest, will
  // meist wissen, was dahintersteckt.
  // Die CSS-Klasse heisst weiter `ks-navi__fassung` (19.09.2026): Sie steht so in
  // oberflaeche.css, und im Haus wird nichts geloescht - auch keine Regel, die nur einen
  // anderen Namen traegt. Sichtbar ist das Wort nirgends, dort steht ueberall "Ausgabe".
  const ausgabezeile = an ? "" : `<a href="#" class="ks-navi__fassung" data-ziel="Über.md">Bindertresor · ${window.ksAusgabe()}</a>`;
  return `<nav class="ks-navi">
    ${warnung}
    ${punkte.map(link).join("")}
    ${an ? link(ueber) : `<div class="ks-navi__trenner"></div>
    <div class="ks-navi__gruppe">System</div>
    ${extra.map(link).join("")}
    ${link(ueber)}
    ${schalter}`}
    ${ausgabezeile}
  </nav>`;
};
