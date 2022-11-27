# MindGest REST API

Instructions for developing and building the project.

## Requirements

For development, you will only need Node.js and a node global package, Yarn, installed in your environment.

### Node & Npm
  
* #### Node installation on Windows
  
  Just go on [official Node.js website](https://nodejs.org/) and download the
  installer.  Also, be sure to have `git` available in your PATH, `npm` might
  need it (You can find git [here](https://git-scm.com/)).
  
* #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

  ```sh
  $ sudo apt install nodejs
  $ sudo apt install npm
  ```

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

  ```sh
  $ node --version
  v18.12.1
  ```
  ```sh
  $ npm --version
  8.19.2
  ```

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

```sh
$ npm install npm -g
```

---

## Install

  ```sh
  $ git clone https://github.com/Mindgest/mindgest-backend
  $ cd api 
  $ npm install
  $ npm run prisma:generate
  ```

## Configuration

Copy the example environment file `.env.example` to a new file name `.env`, edit the parameters and you should be good to go!

Make sure that the database is running on the url
specified in the `.env` file! To be certain that the
schema is up to date run:

```sh
$ npm run prisma:push
```

Furthermore, if you want to seed the database with dummy data that we
provided for testing, just run the following command:

```sh
$ npm run prisma:seed
```

## Inspecting the database
To inspect the data that is currently loaded into the database you may use the following tool.

```sh
$ npm run prisma:studio
```

## Testing the project
To run the integration/unit tests run the following command
```sh
$ npm run test
```

## Running the project
Please set the **NODE_ENV** variable in your `.env` file
to *development* (it should be the default) and run the
following command.
```sh
$ npm run dev
```

## Running/Building in Production
Please set the **NODE_ENV** variable in your `.env` file
to *production* and run the following commands.

```sh
$ npm run build
$ npm start
```

## Cleaning
To clean up all the files generated both during the build
process and a run of the application you can run
the following commands:
```sh
$ npm run clean
```
# Uninstall
To completely remove all the generated files, including
the installed packages please run:
```sh
$ npm run uninstall
```
