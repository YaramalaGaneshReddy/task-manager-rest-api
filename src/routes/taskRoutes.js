const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  taskIdValidator,
  createTaskValidators,
  updateTaskValidators,
} = require("../validators/taskValidators");
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

function taskRoutes(database) {
  const router = express.Router();

  router.use(authMiddleware);
  router.post("/", createTaskValidators, validateRequest, createTask(database));
  router.get("/", getTasks(database));
  router.get("/:id", taskIdValidator, validateRequest, getTask(database));
  router.put("/:id", updateTaskValidators, validateRequest, updateTask(database));
  router.delete("/:id", taskIdValidator, validateRequest, deleteTask(database));

  return router;
}

module.exports = taskRoutes;
