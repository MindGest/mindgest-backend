# MindGest - REST API

This document provides a reference to the tooling developed for this API and a
brief description of the required parametrization. 

## Environment

Both the REST API and the database require some parameter configuration that
allows for the adaptation of the application to different circumstances. This
configuration, for security purposes, was done using environment files that
contain variables that are loaded in the program at runtime. The following 
sections highlight the environment variables' names, types, and descriptions.

### API

* **Email Server**
  - `SMTP_EMAIL` (string)
 
    This environment variable contains the email address of the account used to
    send emails to `the registered users. 
    
    *Example:*
    > noreply@gmail.com

  - `SMTP_PASS` (string)

    This environment variable contains the password or token for authorizing the
    application to send emails from the address defined by **SMTP_EMAIL**
    
    *Example:*
    > dzpqlsunçauhcald 

  - `SMTP_HOST` (string)

    This environment variable contains the name of the host machine (mail server) in charge of sending the email to the user's inbox.

    *Example:*
    > stmp.gmail.com
  
  - `SMTP_PORT` (integer)

    This environment variable contains the host machine (mail server) SMTP port. 
    
    *Example:*
    > 465

* **Frontend Web App URL**
  - `FRONTEND_URL` (URL)

    The URL of the frontend web application. This field
    is required to allow for Cross Origin Resource Policy


* **File Uploads Folder**
  - `FILE_UPLOAD_DIR`(string)

* **Cookie Signing**
  - `COOKIE_SECRET`(string)

* **Authentication**
  - `JWT_ACCESS_SECRET` (string)
  - `JWT_REFRESH_SECRET`(string)
  - `JWT_UTIL_SECRET`  (string)

### PostgresSQL Database

`DATABASE_URL` (URL)

```
postgresql://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB}?schema=public
```

## NPM Scripts

### General

#### Install and Uninstall
  "uninstall": "rimraf build node_modules uploads logs",

#### Build and Clean
  "build": "rimraf ./build && tsc --build && copyfiles -a assets/**/* ./build",
  "clean": "rimraf build uploads logs",

#### Run
  "start": "dotenv -v NODE_ENV=production -e prisma/.env -- node build/src/main.js",
  "dev": "dotenv -v NODE_ENV=development -e prisma/.env -- tsc-watch --onSuccess \"ts-node src/main.ts\"",

### Prisma 

#### Generate Client
  "prisma:generate": "npx prisma generate",

#### Push Schema
  "prisma:push": "npx prisma db push",

#### Seed
  "prisma:seed": "dotenv -v NODE_ENV=production npx prisma db seed",
  "prisma:seed-dev": "dotenv -v NODE_ENV=development npx prisma db seed",
  "prisma:seed-test": "dotenv -v NODE_ENV=test npx prisma db seed",

#### Studio
  "prisma:studio": "npx prisma studio",

### Testing
  "test": "npm run test:db-up && npm run test:run --rootDir test ; npm run test:db-down",

#### Environment
  "test:env": "cp -n prisma/.env.test.example prisma/.env.test",

#### Database
  "test:db-up": "docker compose -f ../util/docker-compose.yml --profile dev up -d --wait --remove-orphans",
  "test:db-down": "docker compose -f ../util/docker-compose.yml --profile dev down --volumes",
  "test:db-setup": "dotenv -e prisma/.env.test -- npm run prisma:push && npm run prisma:seed-test",

### 
  "test:studio": "dotenv -e prisma/.env.test prisma studio",
  "test:jest": "dotenv -v NODE_ENV=test -e prisma/.env.test -- jest",
  "test:run": "npm run test:db-setup && npm run test:jest",

## Util
  "format:check": "prettier --check ."
  "env": "npm run cp -n .env.example .env && cp -n prisma/.env.example prisma/.env",
  "format": "prettier --write . && npx prisma format",