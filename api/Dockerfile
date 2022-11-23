FROM node:18

RUN apt update -y
RUN apt install curl -y

WORKDIR /usr/src/mindgest

COPY ./package*.json ./ 

RUN npm install -g npm --silent
RUN npm install --silent

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 8080 

ENTRYPOINT ["/bin/sh", "-c" , "npx prisma db push --skip-generate && npm start"]

