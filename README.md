# DEXLab Experiment Planner

Browser-based backwards-planning tool for Master Thesis and PhD students in the DEXLab / SBE Marketing & Psychology research group at Maastricht University. Enter your experiment start date, confirm your block period, and get a personalized milestone checklist with real dates and Dutch public holiday warnings.

## Updating for a new academic year

Edit the `CONFIG` object at the top of `index.html`:

1. Update `blockPeriods` with the new BP start dates and week counts
2. Update `fixedHolidays` with any new fixed-date holidays or UM closures
3. Update `bridgeDays` with UM-specific bridge days

Push to `main` — GitHub Actions deploys automatically in ~30 seconds.
