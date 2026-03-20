const mongoose = require("mongoose");

const { env } = require("./env");

async function connectToDatabase() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI, { autoIndex: true });
  // eslint-disable-next-line no-console
  console.log("AAAPKA BACKEND SAKRIYA HOO CHUKA HAI");
}

module.exports = { connectToDatabase };
