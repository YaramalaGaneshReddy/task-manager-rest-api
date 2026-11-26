const express = require("express");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

function createApp(database) {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  });

  app.use("/api/auth", authRoutes(database));
  app.use("/api/tasks", taskRoutes(database));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
