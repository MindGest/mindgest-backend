import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("y.0 check if process is archived correctly", () => {

  it("y.0.0 archive a process correctly", async () => {
    const payload = {
      token: "<token>",
      processId: 0
    }
    const message = {
      message: "Process Archived"
    }
    const result = await request(app)
      .post("/api/process/archive")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("y.1.0 Try to archive unexisting process", async () => {
    const payload = {
      token: "<token>",
      processId: null
    }
    const message = {
      message: "An internal error has occurred while processing the request"
    }
    const result = await request(app)
      .post("/api/process/archive")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
    expect(result.body).toEqual(message)
  })
  
})
