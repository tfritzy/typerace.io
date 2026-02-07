import { generateKeyPairSync } from "crypto";
import { createSshRaceServer } from "./server";

const phrase =
  "The quick brown fox jumps over the lazy dog with steady hands.";

const { privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

const hostKey = Buffer.from(
  privateKey.export({ type: "pkcs1", format: "pem" }) as string
);

const port = Number(process.env.SSH_RACE_PORT ?? "2222");
const host = process.env.SSH_RACE_HOST ?? "0.0.0.0";

const server = createSshRaceServer({
  hostKeys: [hostKey],
  phrase,
  attribution: "Typerace SSH Demo",
  width: 80,
  allowGuest: true,
});

server.listen(port, host, () => {
  process.stdout.write(`SSH demo listening on ${host}:${port}\n`);
  process.stdout.write(`Connect with: ssh -p ${port} demo@localhost\n`);
});
