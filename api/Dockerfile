# Use the latest Node.js version
FROM node:22.11.0 AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application source code
COPY ./src ./src

# Production image
FROM node:22.11.0

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app ./

EXPOSE 5000
CMD ["npm", "run", "dev"]