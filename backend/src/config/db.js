const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

const { env } = require("./env");

function parseMongoUri(uri) {
  try {
    const url = new URL(uri);
    const dbName = decodeURIComponent(url.pathname || "").replace(/^\//, "");
    url.pathname = "/";
    return { serverUri: url.toString(), requestedDbName: dbName || null };
  } catch {
    return { serverUri: uri, requestedDbName: null };
  }
}

async function resolveDbNameCaseInsensitive(uri) {
  const { serverUri, requestedDbName } = parseMongoUri(uri);
  if (!requestedDbName) return { dbName: undefined };

  const client = new MongoClient(serverUri, { serverSelectionTimeoutMS: 5_000 });
  try {
    await client.connect();
    const { databases } = await client.db().admin().listDatabases();
    const match = databases.find((d) => String(d.name).toLowerCase() === requestedDbName.toLowerCase());
    if (match) return { dbName: String(match.name) };
  } catch {
    // If listDatabases fails (permissions / network), fall back to the requested name.
  } finally {
    try {
      await client.close();
    } catch {
      // ignore
    }
  }

  return { dbName: requestedDbName };
}

async function connectToDatabase() {
  mongoose.set("strictQuery", true);

  const { dbName } = await resolveDbNameCaseInsensitive(env.MONGODB_URI);
  await mongoose.connect(env.MONGODB_URI, { autoIndex: true, dbName });

  // eslint-disable-next-line no-console
  console.log("[backend] connected to MongoDB", dbName ? `(db: ${dbName})` : "");
}

module.exports = { connectToDatabase };
