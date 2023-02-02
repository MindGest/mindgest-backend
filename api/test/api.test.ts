import request from "supertest"

import { StatusCodes } from "http-status-codes"
import { describe, it } from "@jest/globals"

import app from "../src/main"

describe("Test if the API and Documentation are working correctly", () => {
  it("Should be healthy", async () => {
    await request(app).get("/api/healthcheck").expect(StatusCodes.OK)
  })

  it("Should redirect the / endpoint to the /api/docs endpoint", async () => {
    await request(app).get("/").expect(StatusCodes.MOVED_PERMANENTLY)
  })

  it("Should display the documentation in the /api/docs endpoint", async () => {
    await request(app).get("/api/docs/").expect(StatusCodes.OK)
  })
})
