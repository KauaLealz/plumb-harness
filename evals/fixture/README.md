# plumb-fixture-api

Minimal payments API used as a fixture for Plumb evals. No dependencies —
Node 20+ only. Run tests with `npm test`.

## Card: PAY-142

Add Pix as a payment method. `POST /payments` should accept
`method: "pix"` and return a QR code payload the client can render.