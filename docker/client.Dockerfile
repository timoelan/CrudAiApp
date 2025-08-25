# Use Node.js 20 Alpine image (newer version for Vite compatibility)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install additional dependencies for alpine
RUN apk add --no-cache wget curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

# Run development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
