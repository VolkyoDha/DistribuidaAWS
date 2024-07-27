FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Copy app source code
COPY . .

# Expose port
EXPOSE 3017

# Command to run the app
CMD [ "node", "index.js" ]