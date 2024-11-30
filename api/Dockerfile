# Use the latest Node.js version
FROM node:22.11.0

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY ./src ./src

# Expose the port
EXPOSE 5000

# Run the development script with nodemon
CMD ["npm", "run", "dev"]
