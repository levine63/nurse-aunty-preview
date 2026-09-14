# NurseAunty preview — RETIRED

**This repository is retired. Do not use it, and do not quote its URL.**

The current published demo is **https://levine63.github.io/NurseAunty-Demo/** (note the
capitals — the path is case-sensitive). The canonical tester URL is
`https://hygieneheroes.berkeley.edu/nurseaunty/demo/`.

## Why it was retired

This preview was copied from `levine63/mamma-app` at commit `2b08180` on 2026-08-14 and
was never updated. It is roughly 200 commits behind, and it predates a correction to how
the app tells a caregiver to measure oral rehydration solution (issue #46). Its clinical
content is therefore **wrong, not merely old**, and it was reachable at a public URL with
nothing on the page saying so.

Every servable page here — the root, the app entry point, the self-contained
`standalone.html`, and the generated-asset gallery — has been replaced with a notice
pointing at the current demo. The data files remain in the repository, but nothing
reachable renders them.

If you saved a copy of `standalone.html` to open offline, delete it. A saved copy keeps
working, and keeps showing the August content, with nothing to tell you so.

NurseAunty is an **unreviewed prototype** carrying **synthetic data only**. It is not
approved for real care, for field use, or for use with real patients. Do not use it to
make a decision about anyone's health.

---

## Reviewer-follow-up log

Kept for the record. These entries describe what reviewers found in this preview and what
was changed in response; the fixes live in the application repository, not here.

- 2026-08-14 — Reviewer feedback: the person picker did not visually distinguish the primary name from Edit/Settings controls, the Add-person action lacked an additive cue, and the ORS drug-seller card was too easy to miss. Root cause: these caregiver-facing actions inherited generic control and card styling without hierarchy checks. Guardrail: review each screen at its target viewport so the primary item/action is visually dominant; use familiar action cues such as “+” only where they match the control’s behavior, and make clinically relevant handoff cards conspicuous without changing their approved copy.

- 2026-08-09 — Reviewer feedback: the home entry screen repeated guidance, ORS choice cards led with decorative images, and Back did not reliably stop speech. Root cause: display and speech behavior were implemented independently without a state-transition check. Guardrail: every screen transition must cancel active media, and action choices should lead with the action rather than nonessential explanatory or decorative content.

- 2026-08-05 — Handwashing feedback: the timer started bundled music by default and the music toggle retained an inaccurate label. Root cause: timer startup unconditionally passed a music asset, while the independent toggle had no state-derived label. Guardrail: optional media must require an explicit user action, and every media control must derive its label from the active state. The preview now separates “Start timer” from “Start timer & music” and uses Start/Stop tune labels.
- 2026-08-05 — Story feedback: an inactive “Read-aloud idle.” message appeared as content. Root cause: the story action renderer showed an initial status string even when no read-aloud action had been requested. Guardrail: hide action-status UI until that action is invoked; use a live region only for real outcomes.
