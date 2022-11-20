import request from "supertest"
import dotenv from "dotenv"

dotenv.config()

import api from "../src/routes/api.route"

describe("GET / - a simple api endpoint", () => {
  it("Hello API Request", async () => {
    const result = await request(api).get("/api")
    expect(result.text).toEqual("<h1>Hello World!</h1>")
    expect(result.statusCode).toEqual(200)
  })
})
