const express = require("express");
const router = express.Router();
const {
  createTask, getTasks, getTaskById, updateTask, deleteTask, getTaskStats,
} = require("../controllers/task.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { createTaskValidator, updateTaskValidator } = require("../validators/task.validator");
const validate = require("../middleware/validate.middleware");

// All task routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /tasks/stats:
 *   get:
 *     summary: Get task statistics
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task stats fetched
 */
router.get("/stats", getTaskStats);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks (paginated, filterable)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Tasks list with pagination
 */
router.get("/", getTasks);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: "Fix login bug" }
 *               description: { type: string }
 *               status: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED] }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *               dueDate: { type: string, format: date, example: "2024-12-31" }
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post("/", createTaskValidator, validate, createTask);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Task not found
 */
router.get("/:id", getTaskById);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED] }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *               dueDate: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Task updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put("/:id", updateTaskValidator, validate, updateTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Task deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete("/:id", deleteTask);

module.exports = router;
