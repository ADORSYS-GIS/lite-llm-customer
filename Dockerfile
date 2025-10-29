# ---------- Stage 1: Builder ----------
    FROM node:20-alpine AS builder
    RUN apk add --no-cache libc6-compat
    WORKDIR /app
    
    ENV NEXT_TELEMETRY_DISABLED=1 \
        NODE_ENV=production \
        SKIP_ENV_VALIDATION=1
    
    # Enable Corepack for Yarn 3+
    RUN corepack enable
    
    # Copy package files
    COPY package.json yarn.lock* ./
    
    # Install deps for build
    RUN yarn install --frozen-lockfile
    
    # Copy rest of the app
    COPY . .
    
    # Build standalone Next.js app (Next.js 13+)
    RUN yarn build && rm -rf node_modules && yarn install --production --ignore-scripts --prefer-offline
    
    # Clean build caches
    RUN rm -rf .next/cache
    
    # ---------- Stage 2: Runner ----------
    FROM node:20-alpine AS runner
    WORKDIR /app
    
    # Create non-root user
    RUN addgroup --system --gid 1001 nodejs \
      && adduser --system --uid 1001 nextjs
    
    ENV NODE_ENV=production \
        NEXT_TELEMETRY_DISABLED=1 \
        PORT=3000 \
        HOSTNAME="0.0.0.0"
    
    # Copy only standalone output (this is key for smaller images)
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    
    USER nextjs
    EXPOSE 3000
    
    # Use node directly (not yarn)
    CMD ["node", "server.js"]
    