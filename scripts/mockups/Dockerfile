# Room mockup job: renders and sets the mockups of products that don't have them yet (DevOps/k3s/mockups.yaml).
# Built from the repo root, since the script draws with the storefront's own renderer in src/.
FROM node:22-slim
WORKDIR /app/scripts/mockups
COPY scripts/mockups/package.json scripts/mockups/package-lock.json ./
RUN npm ci
COPY src /app/src
COPY scripts/mockups/generate.ts ./
USER node
CMD ["node", "--import", "tsx", "generate.ts", "--missing", "--apply"]
