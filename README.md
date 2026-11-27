# DealHound — Black Friday Deal Finder 2026

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/vivcupu21/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/vivcupu21/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

A static Black Friday / Cyber Monday deal finder with 17 real deals from
Amazon, Best Buy, Target and Walmart, checked by hand on 27 November 2026.

Every deal shows its product, store, store link, sale price, usual price,
the time its price was checked, the source that reported the price, and an
honest verdict: **REAL DEAL** (40%+ off or a record low), **Solid deal**
(20–39% off) or **Modest cut** (under 20% off). Search and filters by
category, store and minimum discount all work, and the list sorts by biggest
discount, price or name.

## How to run it

```sh
# serve app/ as static files, then open http://localhost:8080
python3 -m http.server 8080 --directory app
```

No build step, no network requests at run time: the page, its styles,
scripts and deal data are all files under `app/`.

## Hand-in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
into the output directory and writes `dossier.json` with
`vendor/makefun-frontend.ts` from the competition kit.

## Entry

- Competition: `black-friday-deal-finder-01` — Build the best real Black Friday deal finder
- Deadline: 29 November 2026, 00:42 UTC (07:42 WIB)
- License: MIT
