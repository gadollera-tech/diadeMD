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


## NMAT v6 hybrid display

The NMAT practice interface now prefers **typed text** when the source PDF text is sufficiently reliable.

Current converted items:
- Text-first: 218
- Hybrid typed text + original visual: 31
- Image-first: 31

Display rules:
- Verbal analogies are typed.
- Verbal reading-comprehension questions are typed and include extracted passage text.
- Inductive Reasoning and Perceptual Acuity stay image-first because the figures are essential.
- Quantitative uses text-first only for the clearly readable word-problem block; equation/table-heavy items remain image-first.
- Biology, Physics, Social Science, and Chemistry use typed text when extraction is clean, with original-page fallback for figure/table/diagram-dependent items.
- Every typed/hybrid item still has an **Original page** button for source verification.


## HSci 208 Finals Practice

Added:
- `hsci208.html` — course/finals hub
- `hsci208-finals.html` — interactive previous-exam practice
- `js/hsci208-data.js` — source-derived question pool
- `js/hsci208-practice.js` — practice/timer/mix engine
- `assets/references/hsci208-finals/` — original uploaded source files

Current pool: 256 items
- Integumentary: 70
- Musculoskeletal / foundations: 40
- Immune: 146

Answer-key policy:
- `quiz-MS.pdf` contains source-provided answers. Those source-keyed items can be checked/scored.
- The uploaded Word exam files do not provide an explicit answer key. MeduDemy preserves them as authentic practice sets and does **not** invent correct answers.
- The Immune Physiology 55–60 complement-cascade illustration is preserved as an open-response self-review item.


## HSci 208 v8 — answer keys + rationales

Answer provenance is now shown in the interface:
- **SOURCE KEY:** 30 items whose answers were explicitly present in the uploaded source.
- **MEDUDEMY REVIEW KEY:** 225 items where a study answer and concise rationale were added because the source file had no explicit key.
- **INSTRUCTOR CONFIRMATION RECOMMENDED:** 1 ambiguous item intentionally left unscored.

Important:
- Review keys are study aids, not represented as professor-provided official keys.
- The MSK source answer concerning T-tubules in smooth muscle is preserved as written, but the rationale visibly notes that standard physiology generally describes smooth muscle as lacking true T-tubules and using caveolae.
- Timed mode hides rationales until submission; untimed mode allows `Check answer & rationale`.

## v9 — Gamified learning UI

MeduDemy now uses a Duolingo-inspired interaction model without copying Duolingo branding:
- HSci 208 learning path with system units and lesson nodes
- XP stored locally in the browser
- streak indicator
- one-question-at-a-time practice
- large progress bar
- raised answer-choice buttons
- instant answer/rationale feedback in untimed mode
- continue flow instead of traditional exam-navigation chrome
- system challenge nodes for mixed drills

The MeduDemy teal/magenta identity, source-key provenance, private access gate, and existing vault content are preserved.

## v9.1 — MCQ response cleanup

MCQ items now display only clickable answer choices. Textareas are shown only for true recall/open-response items.

## v9.2 definitive MCQ fix
HSci 208 now has one dynamic response area:
- MCQ: choice buttons only
- Recall: recall input only
- Essay: open-response input only

The practice page also uses `?v=9.2` cache-busting for GitHub Pages/browser asset refresh.

## v9.3 — HSci 208 functional fix

Fixed a JavaScript syntax error in `hsci208-practice.js` that prevented:
- exam dropdown population
- Start Untimed
- Start Timed
- Build Finals Mix
- learning-path lesson launch

Also added static fallback exam options and `?v=9.3` cache-busting.
The JS file passes `node --check`.

## v9.4 — ARAL-verified Biochemistry EC/IC
The existing 10 Biochemistry EC & IC questions were upgraded in place using the user's ARAL Attempt 2 review (10/10, 100%):
- option order matches ARAL
- correct answers are marked ARAL VERIFIED KEY
- concise rationales are derived from the ARAL feedback

## v10 — HSci 201: The Human Body (Anatomy)
Added a first-year HSci 201 anatomy vault with 733 mapped practice items (708 source-keyed; 25 Long Quiz I items have no printed key in the uploaded quiz).
- Previous/compiled quizzes: 184
- BRS comprehensive: 102
- Snell regional review: 447

PDF strategy: BRS/Snell items use original rendered question pages with separate answer keys, preserving radiographs, CTs, matching diagrams, and complex page layout. Text-first compilation questions remain normal clickable MCQs.


## v10.1 — HSci 201 source-key repair
- Recovered all 60 Dr. Ade Pelvis & Perineum answers from the bolded correct choices in the original compiled DOCX.
- Recovered BRS answers for Q27, Q76, and Q77 from the BRS Answers & Explanations section.
- HSci 201 now has 708/733 source-supported keys.
- Previous/Compiled Quizzes now have 159/184 source-supported keys.
- The remaining 25 unkeyed items are exactly Long Quiz I; its uploaded quiz pages do not print an answer key.
- Added clearer source badges: COMPILED SOURCE KEY, BRS SOURCE KEY, SNELL SOURCE KEY, and NO SOURCE KEY IN FILE.


## v10.2 — HSci 201 text-first conversion
- Converted ordinary BRS and Snell questions from PDF-page-only presentation into typed question stems and typed answer choices.
- Text MCQs: 575 / 733 total HSci 201 items.
- Text + source-image items: 158 / 733. These are restricted to questions where a radiograph, CT, MRI, angiogram, or labeled figure is necessary.
- Previous/compiled quiz questions remain text-first.
- Source answer provenance and the v10.1 key repairs are preserved.
- Extraction fallbacks retained for: brs-comprehensive Q27, brs-comprehensive Q86, brs-comprehensive Q87, brs-comprehensive Q94, brs-comprehensive Q97, snell-thorax Q29, snell-thorax Q30, snell-thorax Q31, snell-thorax Q33, snell-thorax Q34, snell-thorax Q35

## v10.3 — HSci 201 Long Quiz I review key
The 25 Long Quiz I items did not include a printed answer key in the uploaded source.
For study use:
- 22 items now have a clearly labeled `MEDUDEMY REVIEW KEY` and concise rationale.
- 3 malformed items (Q4, Q9, Q10) are labeled `REVIEW KEY • FLAWED ITEM` and excluded from percentage scoring.
- These added keys are not represented as professor/source-provided answers.

## v11 — Final polish pass
- Simplified main navigation.
- Removed Free/Pro/Premium controls from the main product experience.
- De-emphasized experimental AI and payment pages.
- Removed repetitive prototype/vault language.
- Shortened course-page copy and CTAs.
- Standardized headers, footers, spacing, and card treatment.
- Preserved all HSci 201 / HSci 208 / NMAT questions, keys, rationales, source images, progress, XP, and private access gate.
- Added v11 cache-busting to CSS/JS references.
