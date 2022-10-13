import Server from "./api/server.js";

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";

const server = new Server(HOST, PORT);
server.run();
