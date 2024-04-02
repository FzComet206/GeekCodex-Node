FROM node

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

COPY .env ./dist

WORKDIR ./dist


ENV PROD=true

EXPOSE 3002
CMD ["node", "index.js"]


