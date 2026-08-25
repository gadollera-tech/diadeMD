# MeduDemy v3 Comprehensive Static Prototype

Open `index.html` or run `python -m http.server 8000`.

Included: Home, dashboard, NMAT, med school, all 12 PLE subjects, 12 starter reviewers, 12 original sample questions, Free/Pro local preview, AI/file demo, resource directory, and standards.

Important: accounts, payments, secure premium access, cloud storage, and real AI are not connected. The Pro switch uses browser localStorage only.

Before public launch, medically review all content, add citations and version dates, and verify current PRC/CEM details.


## Added: Integumentary Histology module
- `histology-integumentary.html` — full chapter-based reviewer using the existing MeduDemy visual system
- `assets/references/Histology_Integumentary.pdf` — uploaded course PDF, available as a download
- `js/data.js` — new Integumentary reviewer entry and 40 source-based QBank questions
- `medschool.html` — featured launch card for the new module
- `qbank.html` / `js/app.js` — subject deep-link support and expanded practice-library copy


## Brand kit
The `brand-kit/` folder contains approved MeduDemy logo variations, icons, social profile assets, color palette, and usage guidance.


## Private access-code gate

This build now opens behind a client-side access-code screen.

Temporary access code:
`MEDUDEMY-BETA`

To change it:
1. Open `owner-tools/access-code-generator.html`.
2. Enter the code you want to share.
3. Copy the generated SHA-256 hash.
4. Open `js/access.js`.
5. Replace the value of `ACCESS_HASH`.

Important: because this is a static HTML/JS site, this is a **casual private-beta gate**, not strong security. A technically skilled person can bypass client-side protection. Do not place patient-identifying data, confidential documents, private passwords, or other sensitive material behind this alone. For true restricted access, use backend authentication such as Supabase Auth.

## QBank scope

The old placeholder PLE sampler was removed. The PLE Question Bank is now marked **Coming Soon**.

Current QBank:
- Histology • Integumentary System — 40 questions

## Current positioning

MeduDemy is presented as an **ongoing medical-school vault / diary / learning lab** that grows alongside medical school.

## NMAT interactive practice module

Added `nmat-practice.html` with:
- Untimed subtest practice
- Custom-timed section practice
- Mock mode for Part I, Part II, or all 360 items
- Automatic scoring from the included answer key
- Mark-for-review navigation
- Review-mistakes mode
- Local-only latest-session result storage
- Source-page image viewer so diagrams/figures remain faithful to the PDF
- Downloadable source PDF

The source document does not provide time limits in the included general directions, so the practice timers are intentionally user-defined and are not labeled as official NMAT timing.

Source: Center for Educational Measurement, Inc. (CEM), 2014 practice set. The included copyright notice permits personal/educational reproduction with CEM identified as source, while prohibiting commercial/for-profit redistribution without written permission.
