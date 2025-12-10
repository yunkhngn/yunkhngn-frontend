FROM node:18-alpine

RUN apk add --no-cache openssl


WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate

RUN npm run build

CMD ["npm", "run", "start:dev"]
