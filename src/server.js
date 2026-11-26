require("dotenv").config();

const { createDatabase } = require("./config/database");
const { createApp } = require("./app");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is required. Copy .env.example to .env and configure it.");
  process.exit(1);
}

const port = Number(process.env.PORT) || 5000;
const database = createDatabase();
const app = createApp(database);

const server = app.listen(port, () => {
  console.log(`Task Manager API listening on port ${port}`);
});

function shutdown() {
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
