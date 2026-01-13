# Use the official Playwright image which comes with browsers installed
FROM mcr.microsoft.com/playwright:v1.50.0-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies (backend & frontend)
RUN npm install
RUN cd frontend && npm install

# Copy source code
COPY . .

# Build the project (TypeScript + React)
# Note: We don't need 'npx playwright install' here because the base image has them!
RUN npm run build:prod

# Expose the port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
