import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import http from "node:http";

describe("API Health Endpoint", () => {
  it("should return 200 with status ok on /health", async () => {
    const app = createApp();
    const server = http.createServer(app);

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${address.port}/health`);
      assert.equal(res.status, 200);

      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, "ok");
      assert.equal(body.data.service, "nexora-backend");
      assert.ok(typeof body.data.uptime === "number");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should return 404 with structured error envelope on unknown routes", async () => {
    const app = createApp();
    const server = http.createServer(app);

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${address.port}/non-existent-endpoint`);
      assert.equal(res.status, 404);

      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.code, "NOT_FOUND");
      assert.ok(body.error.correlationId);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
