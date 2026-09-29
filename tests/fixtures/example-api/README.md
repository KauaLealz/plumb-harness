# example-api

A deliberately tiny Express API, used only as a fixture for Plumb's own
evals (`tests/evals/`). Not meant to run in production, and not meant to be
feature-complete — just enough surface (a payments endpoint, one existing
validation rule) for `plumb discover` to detect a real Node/Express project
and for eval scenarios to reference a plausible change.

## Card: PAY-142

Add Pix as a payment method at checkout. The `/payments` endpoint should
accept `method: "pix"` and return a QR code payload. (Deliberately missing
acceptance criteria and a few other ready-checklist details — this card is
the fixture for the "ready blocks on an incomplete card" eval case.)
