# --- Build stage ---
FROM node:18.20.8-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Production stage ---
FROM node:18.20.8-alpine AS production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/firebase ./firebase
COPY --from=builder /usr/src/app/serviceAccountKey.json ./serviceAccountKey.json
EXPOSE 3000
CMD ["node", "dist/main.js"]