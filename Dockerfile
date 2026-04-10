# --- STAGE 1: Build React Frontend ---
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (using clean install for stability)
RUN npm ci

# Copy full source and build
COPY . .
RUN npm run build

# --- STAGE 2: Build Python Backend & Bundle UI ---
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements first
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache_dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Expose port (metadata)
EXPOSE 8080

# Run the backend from the root (main.py will find ../dist relative to itself)
# We set the working directory to backend so main.py relative paths work as before
WORKDIR /app/backend
CMD ["python3", "main.py"]
