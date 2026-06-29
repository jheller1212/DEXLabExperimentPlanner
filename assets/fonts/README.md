# Self-hosted web fonts

These font files are bundled with the site so that **no visitor IP address is sent
to Google's servers** when the page loads. Previously the page pulled these fonts
from `fonts.googleapis.com` / `fonts.gstatic.com`, which transmits each visitor's IP
to Google without consent — a recognised GDPR/privacy concern. Bundling them removes
that third-party request entirely.

## Families & subsets

| Family          | Weights        | Subsets            |
|-----------------|----------------|--------------------|
| Inter           | 400–700 (var.) | latin, latin-ext   |
| Archivo Black   | 400            | latin, latin-ext   |
| JetBrains Mono  | 400–500 (var.) | latin, latin-ext   |

Only the `latin` and `latin-ext` subsets are bundled (covers Dutch, English, German,
French, etc.). Inter and JetBrains Mono are variable fonts, so a single file serves the
whole weight range. The `@font-face` rules live in `../fonts.css`.

## License

All three families are licensed under the **SIL Open Font License v1.1** (OFL), which
permits bundling and redistribution. Upstream sources:

- Inter — https://fonts.google.com/specimen/Inter
- Archivo Black — https://fonts.google.com/specimen/Archivo+Black
- JetBrains Mono — https://fonts.google.com/specimen/JetBrains+Mono

## Regenerating

1. Download the Google Fonts CSS with a modern-browser User-Agent (so `woff2` is served):
   ```
   curl -A "Mozilla/5.0 ... Chrome/120" \
     "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" \
     -o gf.css
   ```
2. Keep only the `latin` / `latin-ext` `@font-face` blocks, download each `woff2`
   into this folder, and rewrite the `src:` URLs to local paths in `../fonts.css`.
   (Identical weights of a variable font share one file — dedupe by URL.)
