const prisma = require("../config/database");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/response");

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "PENDING",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user.id,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return successResponse(res, task, "Task created successfully", 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getTasks = async (req, res) => {
  try {
    const {
      page = 1, limit = 10, status, priority, search,
      sortBy = "createdAt", sortOrder = "desc",
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const isAdmin = req.user.role === "ADMIN";

    const where = {
      ...(isAdmin ? {} : { userId: req.user.id }), // Admins see all tasks
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.task.count({ where }),
    ]);

    return paginatedResponse(res, tasks, total, page, limit, "Tasks fetched successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!task) return errorResponse(res, "Task not found.", 404);

    // Users can only see their own tasks; admins can see all
    if (req.user.role !== "ADMIN" && task.userId !== req.user.id) {
      return errorResponse(res, "Forbidden.", 403);
    }

    return successResponse(res, task, "Task fetched successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return errorResponse(res, "Task not found.", 404);

    if (req.user.role !== "ADMIN" && task.userId !== req.user.id) {
      return errorResponse(res, "Forbidden.", 403);
    }

    const { title, description, status, priority, dueDate } = req.body;

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return successResponse(res, updated, "Task updated successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return errorResponse(res, "Task not found.", 404);

    if (req.user.role !== "ADMIN" && task.userId !== req.user.id) {
      return errorResponse(res, "Forbidden.", 403);
    }

    await prisma.task.delete({ where: { id: req.params.id } });
    return successResponse(res, null, "Task deleted successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getTaskStats = async (req, res) => {
  try {
    const where = req.user.role === "ADMIN" ? {} : { userId: req.user.id };

    const [total, byStatus, byPriority] = await prisma.$transaction([
      prisma.task.count({ where }),
      prisma.task.groupBy({ by: ["status"], where, _count: { status: true } }),
      prisma.task.groupBy({ by: ["priority"], where, _count: { priority: true } }),
    ]);

    return successResponse(res, { total, byStatus, byPriority }, "Stats fetched successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask, getTaskStats };
