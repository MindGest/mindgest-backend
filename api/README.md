# MindGest - REST API

This document provides a reference to the tooling developed for this API and a brief description of
the required parametrization. Furthermore, it shows 

---

## Environment

Both the REST API and the database require some parameter configuration that allows for the
adaptation of the application to different circumstances. This configuration, for security purposes,
was done using environment files that contain variables that are loaded in the program at runtime.
The following sections highlight the environment variables' names, types, and descriptions.

### API

- **Environment**
  `NODE_ENV` (string)
  This environment variable contains the definition of the context in which this API will be run.
  The possible values for this value are:
  * **production**: This value is used when this app is running in the release context 
  * **development**: This value is used when this app is running in the development context
  * **test**: This value is used when this app is running on the test setup.

- **Email Server**

  - `SMTP_EMAIL` (string)

    This environment variable contains the email address of the account used to send emails to `the
    registered users.

    _Example:_

    > noreply@gmail.com

  - `SMTP_PASS` (string)

    This environment variable contains the password or token for authorizing the application to send
    emails from the address defined by **SMTP_EMAIL**

    _Example:_

    > dzpqlsunçauhcald

  - `SMTP_HOST` (string)

    This environment variable contains the name of the host machine (mail server) in charge of
    sending the email to the user's inbox.

    _Example:_

    > stmp.gmail.com

  - `SMTP_PORT` (number)

    This environment variable contains the host machine (mail server) SMTP port.

    _Example:_

    > 465

- **Frontend Web App URL**

  - `FRONTEND_URL` (URL)
    
    This environment variable contains the URL of the web application
    front-end. This field is required due Cross Origin Resource Policy"
    restrictions. This allows the backend server to know and trust the server
    running the front-end, allowing it to upload and download data.

    _Example:_

    > http://localhost:5173/


- **File Uploads Folder**

  - `FILE_UPLOAD_DIR`(string)

    This environment variable contains the path where the assets uploaded to
    the backend server will be stored.

    _Example:_

    > ../uploads 

- **Cookie Signing**

  - `COOKIE_SECRET`(string)
  
    This environment variable contains a secret sequence of characters (typically
    in Base64 encoding) that are used to sign the cookies sent to the frontend web
    application.

    _Example:_

    >  L0IxSj9Rc0hpS3tDQixVemJ9cjpnVTZcTXIsZG5kLGIqMj5HfCtvbitKZmE=Kyc0YC4uPmctS0UmPnpUPEIjY1g6J1t6RiU=

- **Authentication**
  - `JWT_ACCESS_SECRET` (string)

    This environment variable contains a secret sequence of characters (typically
    in Base64 encoding) that are used to sign the access tokens generated for the 
    user upon login. These tokens expire after 15 min
  
  - `JWT_REFRESH_SECRET`(string)

    This environment variable contains a secret sequence of characters (typically
    in Base64 encoding) that are used to sign the refresh tokens generated for the 
    user upon login. These tokens expire after 1 hour

  - `JWT_UTIL_SECRET` (string)
  
    This environment variable contains a secret sequence of characters (typically
    in Base64 encoding) that are used to sign the refresh tokens generated for password
    recovery and account confirmation. These tokens expire after 5 minutes

### PostgresSQL Database

`DATABASE_URL` (URL)

This environment variable contains the URL used by the Prisma ORM to
connect to the database server. This URL is composed of several properties
which are shown in the example below.
```
postgresql://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB}?schema=public
```
- **USER** (string): Database username
- **PASSWORD** (string): Database user password
- **HOST** (string): Database hostname
- **PORT** (number): Database host running port
- **DB** (string): Database name

  _Example:_

  > postgresql://postgres:postgres@localhost:5433/mindgest?schema=public

## Node Package Manager (NPM) Scripts

To automate and shorten some commands that were frequently used during the
development of this project some scripts were created. These scripts are managed
by npm and allow for running and testing the application.

### General

#### Install and Uninstall

To install the required packages for running the application do:

```sh
npm install
```

Conversely, it is possible to uninstall the packages using the utility "uninstall" 
script created for this effect. This script when ran removes the "build"
"node_modules", "uploads", and "logs" folder.

```sh
npm run uninstall
```
#### Build and Clean

To build the typescript application with the typescript compiler and generate
type-checked javascript code do:

```sh
npm run build
```

To remove the build files do:

```sh
npm run clean 
```

#### Run

To run the application just use the "start" script, by issuing the following
command.

```sh
npm start
```

Before this script can be utilized the project must be built.

### Prisma

#### Generate Client

To generate the prisma client library required for the code to run 
just issue the following command:

```sh
npm run prisma:generate
```

This needs to be done before building or running the application.

#### Push Schema

To upload the database schema to the database server use the following command:

```sh
npm run prisma:push
```

#### Seed

In order to seed the database with sample data run the following commands 
depending on the environment.

```sh
npm run prisma:seed      # Seed in the production environment 
npm run prisma:seed-dev  # Seed in the development environment
npm run prisma:seed-test # Seed int the test environment
```

These commands can be called out of the context of these
environments. Nonetheless, they run by default when building the app depending on the 
value of the `NODE_ENV` variable.

#### Studio

Prisma Studio is a UI for visualizing the information currently stored in the 
database server. To start the UI run the following command.

```
npm run prisma:studio
```

### Testing

To run the all the integration tests issue the following command:

```sh
npm test
```

This command will create a docker container with a database
server, populate it with any test data, run the tests, and drop the container once the tests have been completed.

To run a single integration test file you may use:

```sh 
npm run test:jest <file>
```
#### Environment

To generate the required environment files for testing
you can issue the following command:

```sh
npm run tests:env
```

#### Database

To manually control the setup and teardown of
the containers for running integration tests you
may use the following commands.

```sh
npm run test:db-up     # Run the test database container
npm run test:db-down   # Drop the test database container
npm run test:db-setup  # Push Schema and Seed Database
```

### Testing Studio

Prisma Studio is a UI for visualizing the information currently stored in the database server. To start the UI for the testing database server run the following command.

```sh
npm run test:studio
```

## Util

To format/check all the files in the project 
so the code style is consistent you may use the following
two commands.

```sh
npm run format
npm run format:check
```

## Database Entity-Relationship Diagram
The database schema for this application is shown in the picture below.

![DatabaseSchema](../docs/db/v2/mindgest.png)
