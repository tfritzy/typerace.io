import { createServer, logging } from "@opentui/ssh";
import { mountMainMenu } from "./mainMenu";
import * as dotenv from "dotenv";
import { mountApp } from "./app";

const port = Number(process.env.PORT ?? 2222);
const host = process.env.HOST ?? "0.0.0.0";
const hostKeyPath = process.env.SSH_HOST_KEY_PATH ?? "./data/ssh_host_key";

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error(
    `PORT must be an integer from 1 to 65535; received ${process.env.PORT}`,
  );
}

dotenv.config();

const server = createServer({
  hostKey: { path: hostKeyPath },
  auth: "open",
  idleTimeout: process.env.IDLE_TIMEOUT ?? "30m",
  maxTimeout: process.env.MAX_TIMEOUT ?? "4h",
  onError: (error) => console.error(error),
})
  .use(logging())
  .serve((session) => mountApp(session.renderer));

try {
  console.log(`Attempting to start server on ${host}:${port}...`);
  await server.listen(port, host);
  console.log(`Server successfully listening on ${host}:${port}`);
} catch (error) {
  console.error("❌ CRITICAL RUNTIME ERROR ON STARTUP:");
  console.error(error);
  process.exit(1);
}

async function shutdown(): Promise<void> {
  await server.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
