import request from "supertest";
import Server from "../api/server";

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";

describe("GET /", () => {
  let server = new Server(HOST, PORT);
  it("Respond to /", () => request(server.app).get("/").expect(200));
});
