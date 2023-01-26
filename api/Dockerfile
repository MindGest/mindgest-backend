FROM node:18

LABEL MAINTAINER="Pedro Rodrigues <pedror@student.dei.uc.pt>"
LABEL VERSION="0.1.0"

RUN apt-get update -y
RUN apt-get install curl -y

COPY package*.json ./

RUN npm install -g npm --silent
RUN npm install --silent

COPY . .

RUN npx prisma generate
RUN npx prisma seed
RUN npm run build

EXPOSE 8080 

ENTRYPOINT ["/bin/sh", "-c" , "npx prisma db push --skip-generate && npm start"]


