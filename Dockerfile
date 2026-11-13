# Multi-stage production container for Nexora API + Python OR-Tools Optimizer
FROM node:20-bookworm-slim

# Install Python 3, pip and runtime libraries for OR-Tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python optimizer requirements
COPY optimizer/requirements.txt ./optimizer/
RUN pip3 install --no-cache-dir --break-system-packages -r optimizer/requirements.txt

# Copy monorepo package manifests
COPY package*.json ./
COPY packages/contracts/package*.json ./packages/contracts/
COPY backend/package*.json ./backend/

# Install root & workspace dependencies
RUN npm install

# Copy application source code
COPY packages/ ./packages/
COPY backend/ ./backend/
COPY optimizer/ ./optimizer/

# Build shared contracts, generate Prisma Client, and build backend
RUN npm run build:contracts
RUN npm run --workspace=@nexora/backend prisma:generate
RUN npm run --workspace=@nexora/backend build

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Start production API server
CMD ["node", "backend/dist/index.js"]

