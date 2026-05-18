# VE Braille Translator

Browser-based printed Braille scan translator for UEB English Grade 1 Braille without contractions.

## What It Does

- Uploads a scanned Braille image.
- Detects dark printed dots or white embossed Braille dots.
- Groups detected dots into configurable Braille cells.
- Back-translates Unicode Braille cell patterns with Liblouis.
- Supports visible Braille cell boxes and double-sided scan processing.

## Translation Engine

The primary translation engine is Liblouis 3.2.0, bundled locally through the browser/Emscripten build:

- `liblouis-easy-api.js`
- `liblouis-build-utf16.js`
- `tables/unicode.dis`
- `tables/en-ueb-g1.ctb`

The OCR layer detects Braille cells from the image and converts each cell to Unicode Braille. Liblouis then back-translates those cells using `unicode.dis,en-ueb-g1.ctb`.

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
