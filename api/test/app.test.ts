import api from "../src/routes/api.route"
import request from "supertest"

describe("GET / - a simple api endpoint", () => {
  it("Hello API Request", async () => {
    const result = await request(api).get("/api")
    expect(result.text).toEqual("<h1>Hello World!</h1>")
    expect(result.statusCode).toEqual(200)
  })
})
