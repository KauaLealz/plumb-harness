# Secrets

The `secrets` MCP is a **core, mandatory** connector — every Plumb project
gets it, not just ones a discovery signal happens to flag. It's the only
sanctioned way a local secret (an API key, a sandbox credential, a
database password) enters or leaves a Plumb-managed workflow.

## Why mandatory rather than suggested

Two places in the flow need a real secret and have nowhere safe to put
one: `plumb setup` (a colleague's local credentials, cloned from a repo
that must never contain them) and `verify` (recording against a real
sandbox for WireMock stubs). Without a dedicated mechanism, the failure
mode is always the same — a value pasted into `.plumb/config.env`, into a
`.env` file that "definitely" is in `.gitignore` until it isn't, or
straight into the conversation where it sits in a transcript. The `secrets`
MCP exists specifically so none of that ever needs to happen.

## The flow

**Storing** (during `plumb-init`'s "Harness" round, or ad hoc whenever a
new credential comes up):

```
create_secret(name="gateway-api-key", value="...", description="Payment gateway sandbox key")
create_secrets_batch([{name: "...", value: "..."}, ...])   # several at once
```

The agent that calls this is the only place the raw value is ever typed —
after this call, `list_secrets` only ever returns names, never values.

**Consuming**, two ways depending on what needs the secret:

- A tool reads it from a file (`.env`, a JSON config): `apply_secrets_to_file(names=["gateway-api-key"], dest_path=".env.local")`. Writes the value straight to disk; the agent's context never sees it.
- A one-off command needs it as an environment variable: `run_with_secret(secret_name="gateway-api-key", command=["curl", "-H", "Authorization: Bearer $GATEWAY_API_KEY", ...])`. Same guarantee — injected into the subprocess's environment, never surfaced to the agent.

**Importing** an existing `.env` a project already had before Plumb:
`import_secrets_from_file(source_path=".env", overwrite=false)` — brings
every key in as a secret instead of leaving them in a plaintext file.

## The hard rule

`AGENTS.md`'s managed block states this as an "Always": never print,
inline, or commit a secret value. `apply_secrets_to_file` and
`run_with_secret` exist precisely so following that rule never blocks real
work — there's always a path that doesn't require the agent to see the
value.

## What Plumb's own CLI does and doesn't do here

Nothing — deliberately. `plumb` is a Node subprocess; MCP tools are only
reachable from inside an agent's session, not from an arbitrary CLI
process. Every mention of the `secrets` MCP in this harness (skills,
`plumb setup`'s final message, `plumb-verify`'s WireMock reference) is an
instruction to the *agent*, not a wrapped CLI command like `plumb mem` is
around Memanto.
