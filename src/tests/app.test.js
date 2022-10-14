import request from "supertest";
import server from "../api/server";

describe("GET /", () => {
  it("Respond to /", () => request(server).get("/").expect(200));
});
