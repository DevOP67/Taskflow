const { body, query } = require("express-validator");

const createTaskValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 1, max: 100 }).withMessage("Title must be 1-100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description must not exceed 500 characters"),

  body("status")
    .optional()
    .isIn(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .withMessage("Invalid status value"),

  body("priority")
    .optional()
    .isIn(["LOW", "MEDIUM", "HIGH"])
    .withMessage("Invalid priority value"),

  body("dueDate")
    .optional()
    .isISO8601().withMessage("Invalid date format. Use ISO 8601 (e.g. 2024-12-31)"),
];

const updateTaskValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage("Title must be 1-100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description must not exceed 500 characters"),

  body("status")
    .optional()
    .isIn(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .withMessage("Invalid status value"),

  body("priority")
    .optional()
    .isIn(["LOW", "MEDIUM", "HIGH"])
    .withMessage("Invalid priority value"),

  body("dueDate")
    .optional()
    .isISO8601().withMessage("Invalid date format"),
];

module.exports = { createTaskValidator, updateTaskValidator };
