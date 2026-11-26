const { body } = require("express-validator");

const registerValidators = [
  body("name")
    .exists({ values: "undefined" })
    .withMessage("Name is required")
    .bail()
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name is required"),
  body("email")
    .exists({ values: "undefined" })
    .withMessage("Email is required")
    .bail()
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .isEmail()
    .withMessage("A valid email is required")
    .bail()
    .normalizeEmail(),
  body("password")
    .exists({ values: "undefined" })
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

const loginValidators = [
  body("email")
    .exists({ values: "undefined" })
    .withMessage("Email is required")
    .bail()
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .isEmail()
    .withMessage("A valid email is required")
    .bail()
    .normalizeEmail(),
  body("password")
    .exists({ values: "undefined" })
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .notEmpty()
    .withMessage("Password is required"),
];

module.exports = { registerValidators, loginValidators };
