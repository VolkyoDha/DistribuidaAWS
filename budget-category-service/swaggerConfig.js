const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Budget Category Service API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Budget Category service',
    },
  },
  apis: ['./index.js'], // Archivos donde se documentarán las rutas
};

const specs = swaggerJsdoc(options);

module.exports = specs;
