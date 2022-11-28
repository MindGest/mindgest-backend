import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../src/main"

describe("Test if the API and Documentation are working correctly", () => {
  it("Should be healthy", async () => {
    const result = await request(app).get("/api/healthcheck")
    expect(result.status).toEqual(StatusCodes.OK)
  })
  it("Should redirect the / endpoint to the /api/docs endpoint", async () => {
    const result = await request(app).get("/")
    expect(result.status).toEqual(StatusCodes.MOVED_PERMANENTLY)
  })
  it("Should display the documentation in the /api/docs endpoint", async () => {
    const result = await request(app).get("/api/docs/")
    expect(result.status).toEqual(StatusCodes.OK)
  })
})
