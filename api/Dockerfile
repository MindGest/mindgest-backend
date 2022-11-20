FROM node:alpine

WORKDIR /usr/src/api

COPY package*.json ./

RUN apk --no-cache add curl
RUN npm install --silent

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 8080

CMD [ "npm", "start" ]
