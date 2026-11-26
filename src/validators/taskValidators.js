const { body, param } = require("express-validator");

const validStatuses = ["pending", "in_progress", "completed"];

const taskIdValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Task id must be a positive integer")
    .bail()
    .toInt(),
];

const createTaskValidators = [
  body("title")
    .exists({ values: "undefined" })
    .withMessage("Title is required")
    .bail()
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Title must be 100 characters or fewer"),
  body("description")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Description must be a string")
    .bail()
    .isLength({ max: 500 })
    .withMessage("Description must be 500 characters or fewer"),
  body("status")
    .optional({ values: "undefined" })
    .isIn(validStatuses)
    .withMessage("Status must be pending, in_progress, or completed"),
];

const updateTaskValidators = [
  ...taskIdValidator,
  body().custom((bodyValue) => {
    if (!bodyValue || Object.keys(bodyValue).length === 0) {
      throw new Error("At least one task field is required");
    }
    return true;
  }),
  body("title")
    .optional({ values: "undefined" })
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Title must be 100 characters or fewer"),
  body("description")
    .optional({ values: "undefined" })
    .isString()
    .withMessage("Description must be a string")
    .bail()
    .isLength({ max: 500 })
    .withMessage("Description must be 500 characters or fewer"),
  body("status")
    .optional({ values: "undefined" })
    .isIn(validStatuses)
    .withMessage("Status must be pending, in_progress, or completed"),
];

module.exports = {
  taskIdValidator,
  createTaskValidators,
  updateTaskValidators,
};
