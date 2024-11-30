# Use the latest Node.js version
FROM node:22.11.0

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./ 
RUN npm install

# Install nodemon globally for development purposes
RUN npm install -g nodemon

# Copy application source code
COPY ./src ./src

# Expose port
EXPOSE 5000

# Use nodemon to start the server for development
CMD ["nodemon", "src/server.js"]
