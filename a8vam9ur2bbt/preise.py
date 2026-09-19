#!/usr/bin/env python3
"""Preise aller Karten aktualisieren.

Liest jede Notiz in Karten/, holt über die Kennung im Feld `tcgdex` den
Cardmarket-Kennzahlen von TCGdex und schreibt `preis` (Wert-Basis = kleinster Schnitt), `preis_tag`, `preis_7`, `preis_30`,
`preis_trend`, `preis_min`, `preis_stand` und
(falls leer) `bild` ins Frontmatter. Gesendet wird nur die Karten-Kennung.

    python3 Skripte/preise.py            # schreibt
    python3 Skripte/preise.py --probe    # zeigt nur, schreibt nichts
"""
import datetime, json, re, sys, urllib.error, urllib.request
from pathlib import Path

import yaml   # fuer den Kopfblock beim Rechnen; geschrieben wird weiter zeilenweise

VAULT = Path(__file__).resolve().parent.parent
KARTEN = VAULT / "Karten"
API = "https://api.tcgdex.net/v2/{}/cards/"
# Gegenstueck zu window.ksSprachTabelle in Skripte/rahmen.js (18.09.2026) - wer eine
# Sprache ergaenzt, ergaenzt beide. Die Kennung ist bei TCGdex sprachunabhaengig; gefragt
# wird zuerst in der Sprache der Notiz, danach in allen anderen.
SPRACHCODES = {"Deutsch": "de", "Englisch": "en", "Französisch": "fr", "Italienisch": "it",
               "Spanisch": "es", "Portugiesisch": "pt", "Niederländisch": "nl", "Polnisch": "pl",
               "Japanisch": "ja"}
SPRACHEN = tuple(SPRACHCODES.values())
PROBE = "--probe" in sys.argv


def hole(kennung, sprache=None):
    letzter = None
    erst = SPRACHCODES.get(sprache or "")
    reihe = ((erst,) if erst else ()) + tuple(s for s in SPRACHEN if s != erst)
    for spr in reihe:
        try:
            with urllib.request.urlopen(API.format(spr) + kennung, timeout=20) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code != 404:
                raise
            letzter = e
    raise letzter


def feld(text, name):
    m = re.search(rf"^{name}:[ \t]*(.*)$", text, re.M)
    return m.group(1).strip() if m else None


def setze(text, name, wert):
    if re.search(rf"^{name}:", text, re.M):
        return re.sub(rf"^{name}:.*$", f"{name}: {wert}", text, count=1, flags=re.M)
    return text.replace("\n---\n", f"\n{name}: {wert}\n---\n", 1)


def zahl(v):
    """Wie das `zahl` in rahmen.js: leer und unlesbar sind None, alles andere eine Zahl."""
    if v is None or v == "" or isinstance(v, bool):
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def kopfblock(text):
    """Frontmatter einer Notiz als dict. Kein oder kaputter Kopfblock -> {}."""
    if not text.startswith("---\n"):
        return {}
    ende = text.find("\n---", 3)
    if ende < 0:
        return {}
    try:
        d = yaml.safe_load(text[4:ende + 1])
    except yaml.YAMLError:
        return {}
    return d if isinstance(d, dict) else {}


def exemplare(fm):
    """Dieselbe Regel wie window.ksExemplare in Skripte/rahmen.js (Anforderung
    15.09.2026): im Frontmatter steht eine Liste `exemplare`, weil dieselbe Karte mehrfach
    im Bestand sein kann - mit eigenem Zustand, Kaufpreis, Wert oder schon verkauft.
    Fehlt die Liste, wird sie aus den alten Feldern auf Kartenebene gebaut, damit alte
    Notizen unveraendert weiterlaufen. Für den Wert zählen nur `wert_manuell` und
    `verkauft`, die uebrigen Felder bleiben hier außen vor."""
    roh = fm.get("exemplare")
    if isinstance(roh, list) and roh:
        return [e if isinstance(e, dict) else {} for e in roh]
    n = zahl(fm.get("anzahl")) or 1
    eines = {"wert_manuell": fm.get("wert_manuell"), "verkauft": fm.get("verkauft")}
    return [dict(eines) for _ in range(max(1, round(n)))]


def kartenwert(fm):
    """Wert einer Karte wie window.ksWert: je Exemplar der eigene `wert_manuell`, sonst der
    Cardmarket-Preis der Karte; verkaufte Exemplare zählen nicht mehr zum Bestand."""
    preis = zahl(fm.get("preis"))
    summe = 0.0
    for e in exemplare(fm):
        if e.get("verkauft") not in (None, ""):
            continue
        eigen = zahl(e.get("wert_manuell"))
        summe += eigen if eigen is not None else (preis or 0.0)
    return summe


def gesamtwert():
    """Summe über alle Karten – dieselbe Regel wie Dashboard, Album und Sets-Seite."""
    return round(sum(kartenwert(kopfblock(d.read_text(encoding="utf-8")))
                     for d in KARTEN.glob("*.md")), 2)


def bestand():
    """Die zwei Größen, die der MARKT nicht bewegt: Summe der Kaufpreise im Bestand und
    Zahl der Exemplare im Bestand. Gegenstück zur Rechnung in ksPreislaufArbeit
    (Skripte/rahmen.js). Wozu: Ein Depotwert steigt auch, wenn man einzahlt - erst die
    Differenz dieser beiden zwischen zwei Tagen trennt Zukauf von Wertentwicklung."""
    einsatz, stueck = 0.0, 0
    for d in KARTEN.glob("*.md"):
        for e in exemplare(kopfblock(d.read_text(encoding="utf-8"))):
            if e.get("verkauft") not in (None, ""):
                continue
            stueck += 1
            einsatz += zahl(e.get("kaufpreis")) or 0.0
    return round(einsatz, 2), stueck


def marktstand():
    """Der zuletzt geschriebene Markt-Stand aus Wertverlauf.csv – die Basis, auf die dieser
    Lauf seine eigene Bewegung addiert. Gegenstück zu window.ksMarktStand in rahmen.js.
    Fehlt er (alle Zeilen älter als der 19.09.2026), fängt die Reihe bei 0 an."""
    csv = VAULT / "Wertverlauf.csv"
    if not csv.exists():
        return 0.0
    zeilen = [z for z in csv.read_text(encoding="utf-8").splitlines() if z.strip()]
    for z in reversed(zeilen[1:]):
        teile = z.split(";")
        if len(teile) > 4 and teile[4].strip():
            m = zahl(teile[4].strip())
            if m is not None:
                return m
    return 0.0


KOPF = "datum;gesamtwert;einsatz;stueck;markt"


def verlauf_schreiben(bewegung=None):
    """Haengt eine Tageszeile an Wertverlauf.csv an (ein Eintrag je Tag, ein zweiter Lauf am selben Tag ersetzt ihn).
    Grundlage der Wertentwicklung im Dashboard (Wunsch 14.09.2026: 7 Tage, Monat, 6 Monate, 1 Jahr, Max, ab heute).
    Vier Spalten seit 19.09.2026, Gegenstueck zu window.ksVerlaufSchreiben in rahmen.js -
    `einsatz` und `stueck` trennen Zukauf von Marktbewegung (siehe bestand()). Aeltere
    Zeilen haben zwei Spalten und bleiben unveraendert."""
    csv = VAULT / "Wertverlauf.csv"
    heute = datetime.date.today().isoformat()
    zeilen = [z for z in csv.read_text(encoding="utf-8").splitlines() if z.strip()] if csv.exists() else []
    if zeilen and zeilen[0].lower().startswith("datum;"):
        zeilen[0] = KOPF
    else:
        zeilen.insert(0, KOPF)
    zeilen = [z for i, z in enumerate(zeilen) if i == 0 or not z.startswith(heute)]
    einsatz, stueck = bestand()
    markt = "" if bewegung is None else f"{round(marktstand() + bewegung, 2):.2f}"
    zeilen.append(f"{heute};{gesamtwert():.2f};{einsatz:.2f};{stueck};{markt}")
    csv.write_text("\n".join(zeilen) + "\n", encoding="utf-8")
    print(f"Wertverlauf: {heute} → {zeilen[-1].split(';')[1]} € "
          f"(Einsatz {einsatz:.2f} €, {stueck} Exemplare, Markt {markt or '–'})")


def ohne_trend(text, karte, jetzt=None):
    """Was in die Notiz kommt, wenn TCGdex antwortet, Cardmarket aber keinen Trend hat.

    Bis 19.09.2026 stand hier nur der Abruf-Stempel; das Bild wurde erst HINTER dem
    `continue` des Trend-Zweigs gesetzt und blieb damit aus. window.ksTcgdexFelder in
    rahmen.js setzt `bild` dagegen ausserhalb des Cardmarket-Zweigs, schreibt es also
    auch ohne Preis - zwei Sprachen, zwei Verhalten (Durchgang 21, Befund N2).

    Massgeblich ist der JavaScript-Weg, und zwar aus der Sache heraus: Das Bild haengt
    nicht am Preis, sondern an der Antwort von TCGdex. Eine Karte OHNE Cardmarket-Trend
    - Promo, sehr neues Set, japanische Ausgabe - haette hier sonst NIE eine Bildadresse
    bekommen, und genau die braucht sie, weil sie sonst keine hat. Ein selbst abgelegtes
    Foto gewinnt weiter: die Wache `not feld(...)` ist dieselbe wie im Preis-Zweig.
    """
    neu = setze(text, "preis_geholt", (jetzt or datetime.datetime.now()).strftime("%Y-%m-%d %H:%M"))
    if not feld(neu, "bild") and karte.get("image"):
        neu = setze(neu, "bild", karte["image"] + "/high.png")
    return neu


def main():
    if not KARTEN.is_dir():
        sys.exit(f"Ordner fehlt: {KARTEN}")
    ohne, fehler, ok = [], [], []
    # Die Marktbewegung DIESES Laufs: derselbe Bestand, alter Preis gegen neuen. Sie ist das
    # einzige Mass, das Kauf und Verkauf heraushaelt, ohne einen gepflegten Kaufpreis zu
    # brauchen (Begruendung in window.ksVerlaufSchreiben, rahmen.js).
    bewegung = 0.0
    for datei in sorted(KARTEN.glob("*.md")):
        text = datei.read_text(encoding="utf-8")
        if not text.startswith("---\n"):
            ohne.append(datei.stem); continue
        kennung = feld(text, "tcgdex")
        if not kennung:
            ohne.append(datei.stem); continue
        try:
            karte = hole(kennung, feld(text, "sprache"))
        except Exception as e:  # ponytail: Netzfehler nur melden, kein Retry
            fehler.append(f"{datei.stem}: {e}"); continue
        cm = (karte.get("pricing") or {}).get("cardmarket") or {}
        trend = cm.get("trend")
        if trend is None:
            # Gefragt haben wir trotzdem - also wird der Abruf gestempelt (19.09.2026,
            # Durchgang 20, Befund 3). Bis dahin sprang dieser Zweig ohne jeden Schreibvorgang
            # ab; eine Karte ohne Cardmarket-Trend (Promo, neues Set, japanische Ausgabe) hielt
            # damit die Dashboard-Kachel "Preise zuletzt aktualisiert" auf ihrem alten Datum
            # fest. Dieselbe Aenderung steht in window.ksTcgdexFelder in rahmen.js - wer den
            # einen Weg aendert, aendert den anderen.
            # 19.09.2026, Durchgang 21, Befund N2: Hier stand `nur_stempel = setze(text,
            # "preis_geholt", ...)` - nur der Stempel, kein Bild. Die Regel fuer beide
            # Faelle steht seither in ohne_trend() oben, damit der Selbsttest sie halten
            # kann (Befund N5). Der Name `nur_stempel` bleibt, er ist nur nicht mehr woertlich.
            nur_stempel = ohne_trend(text, karte)
            if not PROBE and nur_stempel != text:
                datei.write_text(nur_stempel, encoding="utf-8")
            fehler.append(f"{datei.stem}: kein Cardmarket-Preis bei TCGdex"); continue
        stand = (cm.get("updated") or "")[:10]
        # Wert = kleinster der vier Cardmarket-Schnitte (Entscheidung 14.09.2026): ein Ausreisser-Verkauf nach oben
        # trifft nie alle vier zugleich (Beleg Branawarz: 1.900-€-Verkauf, Trend 369 € bei 164-190 € Angeboten).
        # Ein manuelles Feld `wert_manuell` in der Notiz gewinnt in Dashboard, Album, Tabelle und Karten-Ansicht ueber alles.
        werte = [cm.get(k) for k in ("avg1", "avg7", "avg30", "trend") if cm.get(k) not in (None, 0)]
        preis = min(werte) if werte else trend
        neu = text
        # Zwei Zeitpunkte, wie in window.ksTcgdexFelder: `preis_stand` ist Cardmarkets
        # Rechenstand, `preis_geholt` unsere Uhr beim Abruf (mit Uhrzeit, Ortszeit).
        # Die Dashboard-Kachel "Zuletzt geholt" liest den zweiten.
        geholt = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        for feld_name, wert in (("preis", preis), ("preis_tag", cm.get("avg1")), ("preis_7", cm.get("avg7")),
                                ("preis_30", cm.get("avg30")), ("preis_trend", trend), ("preis_min", cm.get("low")), ("preis_stand", stand),
                                ("preis_geholt", geholt),
                                ("cardmarket_id", cm.get("idProduct"))):
            neu = setze(neu, feld_name, "" if wert is None else wert)
        if not feld(text, "bild") and karte.get("image"):
            neu = setze(neu, "bild", karte["image"] + "/high.png")
        ok.append(f"{datei.stem}: {preis} € (Tag {cm.get('avg1')} · 7T {cm.get('avg7')} · 30T {cm.get('avg30')} · Trend {trend} · ab {cm.get('low')}, Stand {stand})")
        # Bewegung dieser Karte: derselbe Kopfblock, nur mit altem statt neuem Preis.
        # Eine Karte ohne alten Preis ist Zugang, keine Bewegung - sie traegt nichts bei.
        fm = kopfblock(text)
        alt = zahl(fm.get("preis"))
        if alt is not None:
            bewegung += kartenwert({**fm, "preis": preis}) - kartenwert({**fm, "preis": alt})
        if not PROBE and neu != text:
            datei.write_text(neu, encoding="utf-8")
    if not PROBE:
        verlauf_schreiben(round(bewegung, 2))
    print(("PROBE, nichts geschrieben\n" if PROBE else "") + f"{len(ok)} aktualisiert")
    for z in ok: print("  ✓", z)
    if ohne: print(f"{len(ohne)} ohne Kennung (Feld tcgdex leer):"); [print("  –", z) for z in ohne]
    if fehler: print(f"{len(fehler)} Fehler:"); [print("  ✗", z) for z in fehler]


if __name__ == "__main__":
    if "--selbsttest" in sys.argv:
        t = "---\na: 1\npreis_trend: \n---\nx"
        assert feld(t, "a") == "1" and feld(t, "preis_trend") == ""
        assert "preis_trend: 2.5" in setze(t, "preis_trend", 2.5)
        assert "bild: u\n---" in setze(t, "bild", "u")
        # Wert-Regel: muss Zahl fuer Zahl dasselbe liefern wie window.ksWert in rahmen.js
        def w(kopf): return kartenwert(kopfblock("---\n" + kopf + "\n---\nText"))
        assert w("preis: 7.59") == 7.59                            # eine Karte, ein Exemplar
        assert w("preis: 7.59\nanzahl: 2") == 15.18                # alt: anzahl mal Preis
        assert w("preis: 7.59\nexemplare:\n  - zustand: NM\n  - zustand: LP") == 15.18   # neu: Liste
        assert w("preis: 100\nexemplare:\n  - wert_manuell: 250") == 250   # eigener Wert gewinnt
        assert w("exemplare:\n  - wert_manuell: 900") == 900       # gegradet: kein Cardmarket-Preis
        assert w("preis: 100\nwert_manuell: 250") == 250           # alt, ohne Liste
        assert w("preis: 100\nexemplare:\n  - wert_manuell: 250\n  - {}") == 350
        assert w("preis: 100\nexemplare:\n  - verkauft: 2026-09-10") == 0  # verkauft zaehlt nicht
        assert w("preis: 100\nanzahl: 2\nverkauft: 2026-09-10") == 0
        assert w("nummer: 12/34") == 0                             # ohne jeden Preis
        assert w("preis: 100\nexemplare:\n  - wert_manuell: 0") == 0       # 0 ist ein Wert, kein leer
        assert w("preis: 100\nexemplare:\n  - wert_manuell: ''") == 100    # leer faellt auf den Preis
        assert kopfblock("kein Kopfblock") == {} and kopfblock("---\n: :\n---\n") == {}
        # Der Zweig "TCGdex hat geantwortet, Cardmarket hat keinen Trend" (19.09.2026,
        # Durchgang 21, Befund N5). Bis heute hielt ihn nur Technik/Tests/pruef-preise.mjs
        # fest - auf der JavaScript-Seite. Faellt die Regel hier zurueck in den
        # Cardmarket-Zweig, fallen diese Zeilen. Gegenstueck: pruef-preise.mjs Z. 26-28.
        n = "---\nname: x\nsprache: Deutsch\n---\nText"
        r = ohne_trend(n, {"image": "https://assets.tcgdex.net/de/sv/sv04/232"})
        assert re.match(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$", feld(r, "preis_geholt"))   # Stempel im Format von ksJetzt()
        assert feld(r, "bild") == "https://assets.tcgdex.net/de/sv/sv04/232/high.png"     # Bild auch OHNE Preis
        assert feld(r, "preis") is None and feld(r, "preis_stand") is None                # aber kein Preis und kein Cardmarket-Stand
        eigen = "---\nname: x\nbild: Fotos/meine.jpg\n---\nText"
        assert feld(ohne_trend(eigen, {"image": "https://a/1"}), "bild") == "Fotos/meine.jpg"   # eigenes Foto gewinnt
        assert feld(ohne_trend(n, {}), "bild") is None                                    # ohne Bild bei TCGdex kein Feld
        assert feld(ohne_trend(n, {}, datetime.datetime(2026, 9, 19, 2, 0)), "preis_geholt") == "2026-09-19 02:00"
        print("Selbsttest ok"); sys.exit()
    main()
