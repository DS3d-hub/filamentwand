# DS3d – Meine Filamentwand

Mobile Fotogalerie der tatsächlich gedruckten Benchys. Statische Website ohne Anmeldung, externe Schriften, Tracking oder kostenpflichtige Dienste.

## Vorschau

Den Ordner mit einem statischen Webserver öffnen. `index.html` benötigt HTTP, damit `catalog.json` geladen werden kann.

## Sammlung pflegen

Alle öffentlichen Einträge stehen in `catalog.json`. Ein Eintrag enthält `id`, `name`, `manufacturer`, `material`, `types`, `colors`, `image`, `width` und `height`. Die `id` muss dauerhaft eindeutig bleiben. Neue Fotos kommen nach `assets/benchys/`. `updated` enthält das Datum der letzten inhaltlichen Änderung (JJJJ-MM-TT).

Nach Ergänzungen die geänderten Dateien veröffentlichen. Besucher erhalten auf demselben Link den aktuellen Katalog. Der Katalog wird bei jedem Seitenaufruf frisch angefragt; die Seite verwendet keinen Service Worker mit einem veralteten Offline-Katalog. Eine selbstständige Synchronisierung mit Notion ist nicht eingerichtet. Für spätere Ergänzungen ist Notion nicht erforderlich.

## GitHub Pages

Dieses Verzeichnis ist die Wurzel des Website-Repositories. In den Repository-Einstellungen unter Pages als Quelle GitHub Actions auswählen. Der enthaltene Workflow veröffentlicht Änderungen auf `main`. Das Repository muss beim kostenlosen GitHub-Tarif öffentlich sein. Es dürfen keine privaten Sicherungen, Zugangsdaten oder Notion-Exporte in dieses Repository aufgenommen werden.

Fotos und Texte stammen aus der persönlichen Filamentsammlung. Keine Lizenz zur Weiterverwendung der Fotos erteilt.

## Neu, Merkliste und Teilen

Neue Einträge erhalten `addedAt` im Format JJJJ-MM-TT (Tag der ersten Veröffentlichung). Das Schild „Neu“ erscheint an diesem Tag und den acht folgenden Kalendertagen, gerechnet nach Europe/Berlin. Bestandsänderungen verlängern diesen Zeitraum nicht. Bisherige Einträge ohne Datum erhalten kein Schild.

Die Merkliste speichert ausschließlich Eintrags-IDs im localStorage des jeweiligen Browsers. Sie wird weder übertragen noch geräteübergreifend synchronisiert. Ohne Speicherzugriff gilt sie nur für den Besuch. Filter zurücksetzen löscht keine gespeicherten Farben. Der Teilen-Button kopiert einen direkten Link zur Farbe, ohne die persönlichen Filter oder Merkliste; bei blockierter Zwischenablage erscheint ein kopierbares Linkfeld.

## Farbvergleich

Auf den Karten und im Fotodetail lassen sich bis zu vier Farben für den Vergleich auswählen. Die Auswahl bleibt beim Filtern und Wechseln zur Merkliste während des Seitenbesuchs erhalten. Ab zwei Farben öffnet die untere Auswahlleiste die Vergleichsansicht. Auf dem Handy stehen je zwei Fotos nebeneinander. Die Auswahl ist vorübergehend und wird nicht übertragen.

## Hersteller-Shoplinks

Geprüfte Einträge enthalten shopUrl (HTTPS), shopProduct, shopColor und shopCheckedAt. Die Großansicht verlinkt in einem neuen Tab direkt zur Produktvariante. Ohne hinterlegten Link erscheint kein Shop-Button. Die Verfügbarkeit in der Filamentwand bezeichnet den eigenen Bestand, nicht den Shopbestand. Bambu-Farben wurden am 26. Oktober 2026 anhand der offiziellen Produktvarianten zugeordnet; die dortigen Farbnamen können von älteren Bezeichnungen abweichen.
