import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../src/server.js";

async function post(body) {
  const server = createServer().listen(0);
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/payments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: res.status, body: await res.json() };
  } finally {
    server.close();
  }
}

test("creates a pending card payment", async () => {
  const r = await post({ amount: 10 });
  assert.equal(r.status, 201);
  assert.equal(r.body.status, "pending");
});

test("rejects a non-positive amount", async () => {
  const r = await post({ amount: 0 });
  assert.equal(r.status, 400);
});