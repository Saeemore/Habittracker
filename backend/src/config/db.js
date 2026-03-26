const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

const { env } = require("./env");

function buildMongoConnectionHelp(uri) {
  return [
    `Unable to connect to MongoDB at ${uri}.`,
    "Start a MongoDB server locally, run a MongoDB Docker container, or update MONGODB_URI to your MongoDB Atlas connection string.",
    "For local development on this machine, a typical URI is mongodb://127.0.0.1:27017/habittracker."
  ].join(" ");
}

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

  try {
    const { dbName } = await resolveDbNameCaseInsensitive(env.MONGODB_URI);
    await mongoose.connect(env.MONGODB_URI, { autoIndex: true, dbName });

    // eslint-disable-next-line no-console
    console.log("[backend] connected to MongoDB", dbName ? `(db: ${dbName})` : "");
  } catch (error) {
    if (error?.name === "MongooseServerSelectionError") {
      error.message = `${buildMongoConnectionHelp(env.MONGODB_URI)} Original error: ${error.message}`;
    }
    throw error;
  }
}

module.exports = { connectToDatabase };
