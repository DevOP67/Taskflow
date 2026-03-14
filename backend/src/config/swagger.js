const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskFlow API",
      version: "1.0.0",
      description: "Scalable REST API with JWT Authentication & Role-Based Access Control",
      contact: { name: "TaskFlow Support", email: "support@taskflow.com" },
    },
    servers: [
      { url: "http://localhost:5000/api/v1", description: "Development Server" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: { type: "string", enum: ["USER", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
            dueDate: { type: "string", format: "date-time" },
            userId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
