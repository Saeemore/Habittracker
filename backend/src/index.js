require("dotenv").config();

const http = require("http");
const { env } = require("./config/env");
const { connectToDatabase } = require("./config/db");
const { app } = require("./app");

async function main() {
  await connectToDatabase();

  const server = http.createServer(app);
  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on http://localhost:${env.PORT}`);
  });
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("[backend] fatal:", error);
  process.exit(1);
});
