import express from "express";

export function createServer() {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/payments", (req, res) => {
    // Validates the amount recieved in the request body.
    const { amount } = req.body ?? {};
    if (typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ error: "invalid amount" });
      return;
    }
    res.status(201).json({ id: "pay_1", amount, status: "pending" });
  });

  return app;
}
