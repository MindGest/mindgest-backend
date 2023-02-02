# MindGest REST API


---

## Install
```sh
$ git clone https://github.com/Mindgest/mindgest-backend
$ cd api
$ npm install
$ npm run prisma:generate
```

## Configuration

Copy the example environment file `.env.example` to a new file name `.env`, edit the parameters and
you should be good to go!

Make sure that the database is running on the url specified in the `.env` file! To be certain that
the schema is up to date run:

```sh
$ npm run prisma:push
```

Furthermore, if you want to seed the database with dummy data that we provided for testing, just run
the following command:

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
$ npm test
```

## Running the project

Please set the **NODE_ENV** variable in your `.env` file to _development_ (it should be the default)
and run the following command.

```sh
$ npm run dev
```

## Running/Building in Production

Please set the **NODE_ENV** variable in your `.env` file to _production_ and run the following
commands.

```sh
$ npm run build
$ npm start
```

## Cleaning

To clean up all the files generated both during the build process and a run of the application you
can run the following commands:

```sh
$ npm run clean
```

## Uninstalling

To completely remove all the generated files, including the installed packages please run:

```sh
$ npm run uninstall
```
