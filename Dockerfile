# build
FROM node:alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY tsconfig.json .
COPY src ./src
RUN npm run build

# run
FROM node:alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /user/src/app/node_modules ./node_modules
EXPOSE 3001
CMD ["npm", "start"]