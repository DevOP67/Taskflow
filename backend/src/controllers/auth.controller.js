const bcrypt = require("bcryptjs");
const prisma = require("../config/database");
const { generateToken } = require("../utils/jwt");
const { successResponse, errorResponse } = require("../utils/response");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(res, "Email already registered.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = generateToken({ userId: user.id, role: user.role });

    return successResponse(res, { user, token }, "Registration successful", 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse(res, "Invalid email or password.", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, "Invalid email or password.", 401);
    }

    const token = generateToken({ userId: user.id, role: user.role });

    const { password: _, ...userWithoutPassword } = user;
    return successResponse(res, { user: userWithoutPassword, token }, "Login successful");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        _count: { select: { tasks: true } },
      },
    });
    return successResponse(res, user, "Profile fetched successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return errorResponse(res, "Current password is incorrect.", 400);

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

    return successResponse(res, null, "Password changed successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { register, login, getProfile, changePassword };
