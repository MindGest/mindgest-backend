FROM node:latest

WORKDIR /usr/src/api

COPY package*.json ./

RUN npm install --silent

COPY . .

EXPOSE 8080

CMD [ "npm", "run", "dev"]