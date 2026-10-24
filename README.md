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
