# DEXLab Experiment Planner

A backwards-planning tool for Master thesis students and PhD researchers at the [Digital Experience Lab (DEXLab)](https://www.maastrichtuniversity.nl/dexlab), School of Business and Economics, Maastricht University.

Enter your role, block period, and deadline — get every milestone, lab booking step, and deadline laid out in calendar order with Dutch public holiday warnings.

**Live:** [jheller1212.github.io/DEXLabExperimentPlanner](https://jheller1212.github.io/DEXLabExperimentPlanner/)

## Features

- **Backwards planning** from your thesis submission deadline through 5 phases (Before SONA, SONA Setup, Before Experiment, Data Collection, Analysis & Writing)
- **22 auto-generated milestones** with role-specific steps (Master vs PhD)
- **Lab Timetable Calculator** — conditions, design, participants, session length, show-up rate, blocked slots, timetable preview
- **Gantt-style timeline** with chronological task bars, calendar weeks, and today marker
- **Calendar export** — .ics download and per-milestone Google Calendar links
- **Share links** — compressed URL encoding of the full plan state
- **Supervisor email updates** — one-click progress reports
- **Checklist** with localStorage persistence, grouped by phase
- **Dutch holidays** — Easter algorithm + fixed holidays + UM bridge days, flagged automatically
- **Schedule shift** — move data collection by N days, downstream milestones follow
- **Example plan** — pre-filled demo plan accessible from the landing page

## Tech Stack

- Vanilla HTML + CSS + JavaScript (no framework, no build tools)
- Static site hosted on GitHub Pages (auto-deploy on push to `main`)
- State: localStorage + shareable URL hash encoding (compressed base64)

## File Structure

```
index.html          # HTML structure (793 lines)
styles.css          # All CSS — design tokens, components, layout (2221 lines)
app.js              # All JavaScript — state, rendering, calculations (3362 lines)
assets/
  dexlab-logo.png   # Official DEXLab logo (used in topnav + hero watermark)
```

## Design System

- **Palette:** Navy ink (`#0b2545`), DEX cyan (`#0099d8`), LAB orange-red (`#e84e1b`)
- **Fonts:** Archivo Black (display, uppercase), Inter (body), JetBrains Mono (mono)
- **Logo:** Official DEXLab brain-bulb mark

## Updating for a New Academic Year

Edit the `CONFIG` object at the top of `app.js`:

1. **`blockPeriods`** — add new BP start dates and week counts
2. **`fixedHolidays`** — add any new fixed-date holidays or UM closures
3. **`bridgeDays`** — add UM-specific bridge days

Push to `main` — GitHub Actions deploys automatically in ~30 seconds.

## Development

No build tools needed. Open `index.html` in a browser or run a local server:

```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

Pre-push hook runs `node --check app.js` to catch syntax errors before deployment.

## License

Internal tool for Maastricht University DEXLab. Not licensed for external use.
