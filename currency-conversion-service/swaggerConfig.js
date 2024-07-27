const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Currency Exchange Service API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Currency Exchange service',
    },
  },
  apis: ['./index.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
