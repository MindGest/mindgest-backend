import express from "express";

export default class Server {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this.server = express();

    this._setup();
  }

  _setup() {
    this.server.get("/", (req, res) => res.send("<h1>Hello World</h1>"));
  }

  get app() {
    return this.server;
  }

  run() {
    this.server.listen(this.port, this.host, () =>
      console.log(`Server is live at http://${this.host}:${this.port}`)
    );
  }
}
