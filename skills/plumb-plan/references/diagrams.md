# Diagrams

Only for `large` and `complex` work — smaller changes don't earn the extra
step. If the project has Excalidraw configured
(`.plumb/config.env: PLUMB_DIAGRAMS_ENABLED`), generate an architecture or
flow diagram covering what's changing and how it connects to what's not
changing. Link it from `plan.md`; it gets reused in `review`'s PR draft.

No Excalidraw configured, or the project disabled diagrams: describe the
same information as a short text diagram (boxes and arrows in prose) inside
`plan.md` instead of skipping it — `large`/`complex` work still needs the
reader to see the shape of the change, just not necessarily as an image.
