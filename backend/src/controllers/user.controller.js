const prisma = require("../config/database");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/response");

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true, name: true, email: true, role: true, createdAt: true,
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return paginatedResponse(res, users, total, page, limit, "Users fetched successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        tasks: { orderBy: { createdAt: "desc" }, take: 5 },
        _count: { select: { tasks: true } },
      },
    });
    if (!user) return errorResponse(res, "User not found.", 404);
    return successResponse(res, user, "User fetched successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["USER", "ADMIN"].includes(role)) {
      return errorResponse(res, "Invalid role.", 400);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return successResponse(res, user, "User role updated successfully");
  } catch (err) {
    if (err.code === "P2025") return errorResponse(res, "User not found.", 404);
    return errorResponse(res, err.message, 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return errorResponse(res, "Cannot delete your own account.", 400);
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    return successResponse(res, null, "User deleted successfully");
  } catch (err) {
    if (err.code === "P2025") return errorResponse(res, "User not found.", 404);
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };
