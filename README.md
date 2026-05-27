# VE Braille Translator

Browser-based printed Braille scan translator with selectable Liblouis translation tables.

## What It Does

- Uploads a scanned Braille image.
- Detects dark printed dots or white embossed Braille dots.
- Groups detected dots into configurable Braille cells.
- Back-translates Unicode Braille cell patterns with Liblouis.
- Lets users choose the translation table, similar in spirit to DBT/Duxbury table selection.
- Supports visible Braille cell boxes and double-sided scan processing.

## Translation Engine

The primary translation engine is Liblouis 3.2.0, bundled locally through the browser/Emscripten build:

- `liblouis-easy-api.js`
- `liblouis-build-utf16.js`
- `tables/unicode.dis`
- `tables/en-ueb-g1.ctb`
- Other bundled Liblouis tables under `tables/`

The OCR layer detects Braille cells from the image and converts each cell to Unicode Braille. Liblouis then back-translates those cells using `unicode.dis` plus the selected table.

The table selector is generated from the bundled Liblouis table directory. In this build it exposes 260 local `.ctb`, `.utb`, and `.tbl` tables as selectable translation tables, with all 368 Liblouis table/support files bundled alongside them, including `.cti`, `.uti`, `.dis`, and `.dic` dependencies.

Duxbury DBT supports many proprietary tables and templates. This app uses Liblouis-compatible tables that are bundled and served locally.

If Liblouis cannot initialize, the app falls back to a small local UEB Grade 1 table and shows that fallback state in the UI.

## Run Locally

```bash
node dev-server.js
```

Open:

```text
http://127.0.0.1:5177/
```

## Demo

The Demo button loads `demo-braille.png`, a dark printed Braille sample.
