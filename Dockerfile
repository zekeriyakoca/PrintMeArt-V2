# Storefront: Angular server-side rendering on Node.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY scripts/patch-angular-build.js scripts/
RUN npm ci
COPY . .
RUN npm run build

# The server bundle is self-contained: only the built files are needed
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=4000
COPY --from=build /app/dist/store-front ./dist/store-front
USER node
EXPOSE 4000
CMD ["node", "dist/store-front/server/server.mjs"]
