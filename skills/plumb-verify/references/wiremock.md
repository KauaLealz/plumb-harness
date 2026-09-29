# WireMock stubs

For every external service the plan flagged as a context, register a stub
via WireMock's admin API covering the happy path and the failure the plan
called for (timeout, 500, malformed response). Use stateful scenarios when
the flow depends on call order (e.g. pending → confirmed).

After the scenario runs, check WireMock's request log to confirm the
application actually sent what it should have — not just that it handled
the mocked response, but that the outgoing call (headers, body, idempotency
key, whatever the context requires) was correct.

Recordings from real sandboxes must be masked before they're committed as
fixtures — never commit a raw sandbox recording.
