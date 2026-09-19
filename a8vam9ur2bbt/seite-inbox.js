// Inbox im Rahmen (15.09.2026). Aufruf aus Inbox.md: await dv.view("Skripte/seite-inbox");
await dv.view("Skripte/rahmen");

const ZIEL = "Inbox";
const BILD = /\.(jpe?g|png|heic|heif|webp|gif|tiff?)$/i;
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const kb = (n) => n < 1024 ? `${n} B` : n < 1048576 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`;

const wartend = app.vault.getFiles().filter(f => f.path.startsWith(ZIEL + "/") && BILD.test(f.name));
const liste = wartend.length === 0
  ? `<div class="ks-karte__leer">Noch leer.</div>`
  : wartend.map(f => `<a class="ks-zeile" href="#" data-ziel="${esc(f.path)}">
      <img class="ks-zeile__bild" src="${esc(app.vault.getResourcePath(f))}" alt="">
      <span class="ks-zeile__text"><span class="ks-zeile__name">${esc(f.name)}</span></span>
      <span class="ks-zeile__wert">${kb(f.stat.size)}</span></a>`).join("");

const html = `<div class="ks-seite">
  ${window.ksNaviHtml("Inbox.md")}
  <div class="ks-seite__inhalt">
    <div class="ks-kopf"><div>
      <div class="ks-kopf__label">Bindertresor · Inbox</div>
      <div class="ks-kopf__titel">Fotos ablegen</div>
    </div><div class="ks-kopf__rechts">${window.ksNeuKnopfHtml("Karte von Hand anlegen")}</div></div>
    <!-- Karte anlegen ohne Claude (18.09.2026), dieselbe Quelle wie im Album: rahmen.js -->
    ${window.ksNeuHtml({ modus: "anlegen" })}
    <div class="ks-flaeche">
      <div class="ks-ablage" id="ks-ablage">Kartenfotos hierher ziehen</div>
      <div class="ks-ablage__aktionen">
        <button class="ks-knopf" data-befehl="wählen">Fotos wählen</button>
        <span style="color:var(--still);font-size:12px">landet in <code>${ZIEL}/</code> · danach im Chat „Inbox scannen" sagen</span>
      </div>
    </div>
    <div class="ks-flaeche">
      <div class="ks-flaeche__kopf"><span class="ks-flaeche__titel">Wartet auf den Scan</span>
        <span class="ks-kopf__label">${wartend.length} ${wartend.length === 1 ? "Foto" : "Fotos"}</span></div>
      <div id="ks-liste">${liste}</div>
    </div>
  </div>
</div>`;

// Dateien ablegen – nie überschreiben, bei Namensgleichheit " (2)"
// Über ksNacheinander wie jeder andere Schreibvorgang: Warteschlange und entprellter
// Neuaufbau, damit sich zwei Abwuerfe nicht ueberholen. Das Blatt wird über den RAHMEN
// gesucht statt über app.workspace.activeLeaf - so trifft es auch dann den richtigen Tab,
// wenn nebenher etwas anderes im Vordergrund liegt, und es wirft nicht, wenn gerade kein
// Blatt aktiv ist.
let rahmen;
const ablegen = (dateien) => window.ksNacheinander(async () => {
  let neu = 0, uebersprungen = 0;
  for (const d of dateien) {
    if (!BILD.test(d.name)) { uebersprungen++; continue; }
    let name = d.name, n = 2;
    while (app.vault.getAbstractFileByPath(`${ZIEL}/${name}`)) {
      const punkt = d.name.lastIndexOf(".");
      name = `${d.name.slice(0, punkt)} (${n})${d.name.slice(punkt)}`; n++;
    }
    await app.vault.createBinary(`${ZIEL}/${name}`, await d.arrayBuffer());
    neu++;
  }
  new Notice(`${neu} ${neu === 1 ? "Foto" : "Fotos"} abgelegt${uebersprungen ? `, ${uebersprungen} übersprungen (kein Bild)` : ""}`);
}, () => {
  const blatt = app.workspace.getLeavesOfType("markdown")
    .find((l) => l.view?.containerEl?.contains(rahmen));
  blatt?.rebuildView?.();
});

rahmen = await window.ksRahmen(dv, {
  html, hoehe: "calc(100vh - 144px)",
  befehl: (name) => {
    if (name !== "wählen") return;
    const wahl = document.createElement("input");
    wahl.type = "file"; wahl.multiple = true; wahl.accept = "image/*";
    wahl.addEventListener("change", () => ablegen([...wahl.files]));
    wahl.click();
  },
  fertig: (dok) => {
    const zone = dok.getElementById("ks-ablage");
    const an = (e) => { e.preventDefault(); zone.classList.add("ks-ablage--an"); };
    const aus = () => zone.classList.remove("ks-ablage--an");
    zone.addEventListener("dragover", an);
    zone.addEventListener("dragenter", an);
    zone.addEventListener("dragleave", aus);
    zone.addEventListener("drop", async (e) => {
      e.preventDefault(); aus();
      await ablegen([...(e.dataTransfer?.files || [])]);
    });
  },
});
