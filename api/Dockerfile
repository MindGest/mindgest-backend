FROM node:alpine

WORKDIR /usr/src/mindgest

COPY ./package*.json ./ 

RUN npm install -g npm --silent
RUN npm install --silent

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 8080 

CMD [ "npm", "start" ]
