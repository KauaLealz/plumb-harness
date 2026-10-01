import { createServer as createHttpServer } from "node:http";

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return null;
  }
}

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

export function createServer() {
  let nextId = 1;

  return createHttpServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      return send(res, 200, { status: "ok" });
    }

    if (req.method === "POST" && req.url === "/payments") {
      // Validates the amount recieved in the request body.
      const body = await readJson(req);
      const amount = body?.amount;
      if (typeof amount !== "number" || amount <= 0) {
        return send(res, 400, { error: "invalid amount" });
      }
      return send(res, 201, { id: `pay_${nextId++}`, amount, method: "card", status: "pending" });
    }

    send(res, 404, { error: "not found" });
  });
}