# # Use a lightweight base image
# FROM busybox:latest

# # Install Bun
# COPY --from=docker.io/oven/bun:latest /bun /bun

# # Set the entrypoint
# ENTRYPOINT ["/bun/bun"]

# FROM oven/bun:1.0.30

# WORKDIR /app

# COPY package*.json ./

# RUN bun install

# COPY . .

# EXPOSE ${PORT:-3000}
 
# CMD ["bun", "run",  "server.ts"]



# Builder stage
FROM oven/bun:1.0.30 AS builder
WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .

# Final stage
FROM busybox:latest
COPY --from=builder /bun /bun
COPY --from=builder /app/src/index.ts /app/
WORKDIR /app
EXPOSE ${PORT:-3000}
ENTRYPOINT ["/bun/bun", "run", "src/index.ts"]