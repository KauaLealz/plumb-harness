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

If recording against a real sandbox needs a credential, get it via the
`secrets` MCP's `run_with_secret` (injects it as an env var for that one
command) or `apply_secrets_to_file` (writes it into whatever config file
the recording tool reads) — never `create_secret`'s counterpart `value`
typed into the conversation by hand, and never a credential pasted into
`.plumb/config.env`.
