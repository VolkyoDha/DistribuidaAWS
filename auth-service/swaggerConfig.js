const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Auth service',
    },
  },
  apis: ['./index.js'], // Ruta a tus archivos de ruta
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
