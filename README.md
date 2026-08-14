# NurseAunty preview

Public, browser-ready preview of the NurseAunty/Mamma prototype.

This repository contains only the runtime files needed by the static web app, copied from `levine63/mamma-app` commit `2b08180`. It deliberately excludes private project history.

The preview contains synthetic demonstration profiles only; it must not be used with real patient information. The clinical material remains clearly labeled as prototype content pending clinical review.

## Reviewer-follow-up log

- 2026-08-14 — Reviewer feedback: the person picker did not visually distinguish the primary name from Edit/Settings controls, the Add-person action lacked an additive cue, and the ORS drug-seller card was too easy to miss. Root cause: these caregiver-facing actions inherited generic control and card styling without hierarchy checks. Guardrail: review each screen at its target viewport so the primary item/action is visually dominant; use familiar action cues such as “+” only where they match the control’s behavior, and make clinically relevant handoff cards conspicuous without changing their approved copy.

- 2026-08-09 — Reviewer feedback: the home entry screen repeated guidance, ORS choice cards led with decorative images, and Back did not reliably stop speech. Root cause: display and speech behavior were implemented independently without a state-transition check. Guardrail: every screen transition must cancel active media, and action choices should lead with the action rather than nonessential explanatory or decorative content.

- 2026-08-05 — Handwashing feedback: the timer started bundled music by default and the music toggle retained an inaccurate label. Root cause: timer startup unconditionally passed a music asset, while the independent toggle had no state-derived label. Guardrail: optional media must require an explicit user action, and every media control must derive its label from the active state. The preview now separates “Start timer” from “Start timer & music” and uses Start/Stop tune labels.
- 2026-08-05 — Story feedback: an inactive “Read-aloud idle.” message appeared as content. Root cause: the story action renderer showed an initial status string even when no read-aloud action had been requested. Guardrail: hide action-status UI until that action is invoked; use a live region only for real outcomes.
