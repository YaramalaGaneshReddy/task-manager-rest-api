const express = require("express");
const validateRequest = require("../middleware/validateRequest");
const { registerValidators, loginValidators } = require("../validators/authValidators");
const { register, login } = require("../controllers/authController");

function authRoutes(database) {
  const router = express.Router();

  router.post("/register", registerValidators, validateRequest, register(database));
  router.post("/login", loginValidators, validateRequest, login(database));

  return router;
}

module.exports = authRoutes;
