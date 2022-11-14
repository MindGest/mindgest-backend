FROM node:alpine

WORKDIR /usr/src/api

COPY package*.json ./

RUN npm install --silent

COPY . .

RUN npx prisma generate
RUN npx prisma db push

RUN npm run build

EXPOSE 8080

CMD [ "npm", "start"]
