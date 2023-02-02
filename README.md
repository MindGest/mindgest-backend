# MindGest Backend

![Build](https://github.com/MindGest/mindgest-backend/actions/workflows/node.js.yml/badge.svg?brach=main)

![Node](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=Swagger&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

A simple **nodejs** + **express** implementation of a REST API (backend server) for the MindGest Web Application.

<p align="center"><img src="./docs/assets/mindgest.png"><p>

## About the Project

Currently, the Center for Provision of Services to the Community, of the Faculty
of Psychology and Educational Sciences at the University of Coimbra,
CPSC-FPCE-UC, makes use of an old-fashioned, complex service management platform
that does not respond to its user's needs.

This project, carried out within the scope of the Project Management (2022/2023)
course, attempts to develop a prototype of a management platform (MindGest) that
addresses the existing problems. With this new platform, we attempt to automate
time-consuming and complex tasks that are currently carried out manually.
Overall, we intend to improve the current platform functionalities, thus making
them simple and more user-friendly.

---

## Development

If you are a developer, you might be interested on a more in-depth look of the
project. Check this [README](./api/README.md) to learn more about how can you
use the tools made available through npm scripts.

### Project Structure

* `api`: The source code of the API
* `docs`: Miscellaneous resources/artifacts generated during the development of the backend.
  + `assets`: Logos (Miscellaneous)
  + `db`: Database diagrams and documentation
  + `team`: Backend team *planning poker* estimations
* `util`: Utilities + Tools for backend deployment (docker)

### Documentation

The documentation for the MIndGest Backend (REST API) can be consulted by
running the server and accessing the `/api/docs` endpoint. 

### Dashboard & Issues

If you find something not working as expected or you have any suggestions feel
free to submit an [issue](https://github.com/MindGest/mindgest-backend/issues).
Please use the [templates](./.github/ISSUE_TEMPLATE/) provided! 

## Deploying

This deployment tutorial will assume you are running linux or any debian based distribution.
Nonetheless, it's possible to deploy on other platforms. 

Before choosing the method for deploying the application you must first clone this project.

```sh
git clone https://github.com/MindGest/mindgest-backend.git
```

Afterwards, choose your preformed method for running the application and follow
the steps.  

### Native
To deploy this project you may want to run the software natively. For
that you will need a database server running `PostgresSQL`, as well as 
an installation of the `nodejs` and `npm` tools . stribuition:

#### 1. Node and NPM
* Install Software
    You can install nodejs and npm easily with apt install, just run the following commands.
    ```sh
    sudo apt install nodejs npm -y
    ```
* Check Installation
  ```sh
  node --version
  npm --version
  ```
  If you need to update `npm`, you can make it using `npm`! Cool right? After running the following
  command, just open again the command line and be happy.

  ```sh
  npm install npm -g
  ```

#### 2. Database 

* Install a postgresSQL DBMS Server on your machine by running the following commands.
  For more information, troubleshooting or a detail tutorial check the following [link](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-16-04).

  ```
  sudo apt-get update
  sudo apt-get install postgresql postgresql-contrib
  ```

#### 2. Configure Environment 
To configure both the database and the REST API generate the environment `.env`
files from the examples provided. There are some examples provided for you! To
ease the generation of these files run the following command.

```sh
cd api && npm run env
```
This will generate `.env` files in the `api` and `api/prisma` folders that will contain the server configurations and database URLs.

#### 3. Setup Database 

In the `api` folder run the following commands
```sh
npm run prisma:generate
npm run prisma:push
```

#### 4. Run Application

That's it! Now you can just build and run the application.

```sh
npm run build
npm start
```
### Docker
To deploy this project you may use the docker images provided.

#### 1. Install Docker 
Install docker by running the commands below. For a more detailed tutorial check the
the following [link](https://docs.docker.com/engine/install/ubuntu/).

```sh
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

#### 2. Configure Environment 
To configure both the database and the REST API generate the environment `.env`
files from the examples provided. There are some examples provided for you! To
ease the generation of these files run the following command.

```sh
cd api && npm run env
```
This will generate `.env` files in the `api` and `api/prisma` folders that will contain the server configurations and database URLs.

Additionally, in the `util` folder and run the following command to configure
the settings for the database container.

```sh
cp .env.example .env
```

#### 3. Run Application

You are now ready to run the API! Just go to the `util` folder and 
run the following command.

```sh
  docker compose --profile prod up --build -d 
  docker-compose --profile prod up --build -d # Alternative Command
```

This will start the database and API server in docker containers running 
in the background in a isolated network exposing the `8080` and `5432` ports.
Furthermore the database will be seeded with relevant information required for a
production environment.

That's it!! You are good to go.

## Production Server
For the time being the application will be hosted on the following url:
> https://mindgest.dei.uc.pt

## Contributing
Contributions are what make the open-source community such an amazing place to
learn, inspire, and create. Any contributions you make are greatly appreciated.

* Fork the Project
+ Create your Feature Branch (git checkout -b feature/AmazingFeature)
* Commit your changes (git commit -m 'Add some AmazingFeature') Push to the Branch (git push origin feature/AmazingFeature) 
* Open a Pull Request

## License
This project is distributed under the [MIT](LICENSE) License.

## Developers
* [Gabriel Fernandes](http://github.com/gabrielmendesfernandes)
* [João Cruz](https://github.com/JotaCruz20)
* [Pedro Rodrigues](https://github.com/pedromig)

## Testers
* [André Silva]()
* [Eurico]()