const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Calculator Service API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Calculator service',
    },
  },
  apis: ['./index.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
