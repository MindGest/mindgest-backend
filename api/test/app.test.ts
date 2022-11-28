import request from "supertest"
import dotenv from "dotenv"
import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../src/main"

describe("Test if the REST API runs", () => {
  it("Should be healthy", async () => {
    const result = await request(app).get("/api/healthcheck")
    expect(result.status).toEqual(200)
  })
})
