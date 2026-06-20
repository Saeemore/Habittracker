const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Trackify API",
      version: "1.0.0",
      description:
        "AI-powered Habit Tracker API — built with Node.js, Express, MongoDB and FastAPI ML service",
      contact: {
        name: "Trackify Team",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;