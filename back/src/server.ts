import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./utils/env.js";

const app = createApp();
const server = createServer(app);

server.on("error", (err: any) => {
  if (err?.code === "EADDRINUSE") {
    // eslint-disable-next-line no-console
    console.error(
      `\nPort ${env.PORT} is already in use.\n` +
      `- Stop the other process using it, OR\n` +
      `- Set PORT in back/.env (example: PORT=5001)\n`
    );
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.error("Server error:", err);
  process.exit(1);
});

server.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`PFE Compass backend listening on http://localhost:${env.PORT}`);
});
