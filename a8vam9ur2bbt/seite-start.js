// Startseite (19.09.2026, Marks Freigabe). Aufruf aus Start.md: await dv.view("Skripte/seite-start");
//
// Warum es sie gibt: Ein Käufer öffnet den Vault und sah bis heute fünf Seiten ohne einen
// Satz, der sagt, wo er anfängt - und ein Dashboard, das „noch kein Preis" meldet, weil die
// Sammlung leer ist. Diese Seite ist der Anfang: drei Schritte, in der Reihenfolge, in der
// man sie geht, und ein Weg zu jedem davon.
//
// Sie rechnet mit: Sobald Karten da sind, verschwinden die erledigten Schritte nicht, aber
// sie zeigen ihren Stand. Wer schon 300 Karten hat, sieht auf einen Blick, dass er hier
// nichts mehr zu tun hat.
await dv.view("Skripte/rahmen");

const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Gemessen, nicht behauptet: Der Stand jedes Schritts kommt aus dem Vault selbst.
const dateien = window.ksKartenDateien();
let stueck = 0, mitPreis = 0, mitEigenemFoto = 0;
for (const datei of dateien) {
  const fm = app.metadataCache.getFileCache(datei)?.frontmatter ?? {};
  stueck += window.ksWert(fm, window.ksZahl(fm.preis)).stueck;
  if (window.ksZahl(fm.preis) != null) mitPreis++;
  // Ein eigenes Foto ist ein Vault-Pfad, kein http-Link auf TCGdex.
  const bild = String(fm.bild ?? "").trim();
  if (bild && !/^https?:\/\//i.test(bild)) mitEigenemFoto++;
}
const hatKarten = dateien.length > 0;

// Ein Schritt: Nummer, Satz, Weg dorthin, und der eigene Stand rechts.
const schritt = (nr, titel, text, ziel, knopf, fertig, stand) => `
  <a class="ks-start__schritt${fertig ? " ks-start__schritt--fertig" : ""}" href="#" data-ziel="${esc(ziel)}">
    <span class="ks-start__nr">${fertig ? "✓" : nr}</span>
    <span class="ks-start__text">
      <span class="ks-start__titel">${esc(titel)}</span>
      <span class="ks-start__satz">${text}</span>
    </span>
    <span class="ks-start__weg">
      <span class="ks-start__stand">${esc(stand)}</span>
      <span class="ks-knopf ks-start__knopf">${esc(knopf)}</span>
    </span>
  </a>`;

const html = `<div class="ks-seite">
  ${window.ksNaviHtml("Start.md")}
  <div class="ks-seite__inhalt">
    <div class="ks-kopf">
      <div><div class="ks-kopf__label">Bindertresor</div>
        <div class="ks-kopf__titel">${hatKarten ? "Weitermachen" : "Fang hier an"}</div></div>
    </div>

    <div class="ks-flaeche">
      <div class="ks-start">
        ${schritt(1, "Die erste Karte anlegen",
          "Im Album auf <strong>Karte anlegen</strong>, Name und Nummer eintippen, aus den Treffern die richtige wählen. Preis und Bild kommen mit.",
          "Album.md", "Zum Album", hatKarten,
          // Hier stand bis 19.09.2026 `dateien.length` - also NOTIZEN, benannt als "Karten"
          // (Durchgang 20, Befund 1). Einen Klick weiter sagte das Album "73 KARTEN" und die
          // Dashboard-Kachel "Karten 73", diese Zeile "63 Karten da": dasselbe Wort fuer zwei
          // Mengen. Nach Marks Wortregelung vom 18.09.2026 heisst "Karte" das EXEMPLAR -
          // gezaehlt wird darum `stueck` (bis heute berechnet und nie benutzt).
          // Drei Lagen, drei Saetze, wie im Album-Kopf: Bestand da / alles verkauft / leer.
          stueck > 0 ? `${stueck} ${stueck === 1 ? "Karte" : "Karten"} da`
                     : (hatKarten ? "alles verkauft" : "noch keine Karte"))}

        ${schritt(2, "Preise holen",
          "Auf dem Dashboard der Knopf <strong>Jetzt aktualisieren</strong>. Er fragt für jede Karte den aktuellen Marktpreis ab und schreibt ihn in deine Sammlung.",
          "Dashboard.md", "Zum Dashboard", mitPreis > 0,
          // "63 mit Preis" trug bis 19.09.2026 gar keine Einheit (Durchgang 20, Befund 1);
          // `Funktionen.md` verlangt "Der Stand traegt seine Einheit". `mitPreis` zaehlt
          // NOTIZEN, also das Wort dafuer - aus der einen Stelle, window.ksVerschieden.
          mitPreis > 0 ? `${window.ksVerschieden(mitPreis)} mit Preis` : "noch keine Preise")}

        ${schritt(3, "Eigene Fotos ablegen",
          "Fotos deiner echten Karten legst du in den Ordner <strong>Inbox</strong>. Gegradete Karten zeigst du so, wie sie bei dir liegen - im Slab.",
          "Inbox.md", "Zur Inbox", mitEigenemFoto > 0,
          // Dieselbe Einheitenregel wie eine Zeile darueber (Durchgang 20, Befund 1): Das
          // Feld `bild` steht auf Kartenebene, `mitEigenemFoto` zaehlt also NOTIZEN.
          mitEigenemFoto > 0 ? `${window.ksVerschieden(mitEigenemFoto)} mit eigenem Foto` : "noch keine eigenen Fotos")}
      </div>
    </div>

    <div class="ks-flaeche">
      <div class="ks-flaeche__kopf"><span class="ks-flaeche__titel">Wo was steht</span></div>
      <div class="ks-ueber__text">
        <p><strong>Album</strong> zeigt jede Karte als Kachel, mit Suche, Filtern und Sortierung. <strong>Sets</strong> sagt dir, wie weit jedes Set zusammen ist. <strong>Erfolge</strong> rechnet 25 Ziele aus deiner Sammlung aus - nichts davon musst du pflegen.</p>
        <p>Auf dem <strong>Dashboard</strong> stehen Gesamtwert, Wertverlauf und die Karten, die sich am stärksten bewegt haben.</p>
        <p>Unter <strong>Über</strong> steht, woher die Preise kommen, was deinen Rechner verlässt und wohin du schreibst, wenn etwas nicht funktioniert.</p>
      </div>
    </div>
  </div>
</div>`;

window.ksRahmen(dv, { html, hoehe: "calc(100vh - 144px)" });
