# Multi-stage production Dockerfile for Audrin Fire Engineers

# Stage 1: Build the React + Vite application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy full application source code
COPY . .

# Build static production assets
RUN npm run build

# Stage 2: Serve with lightweight Nginx web server
FROM nginx:alpine AS runner

# Copy customized Nginx configuration for single-page application routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard web port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
