import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("(y+8).0 test process creation", () => {
  it("(y+8).0.0 test process creation successfully", async () => {
    const payload = {
      token: "<auth_token>",
      patientId: 0,
      therapistId: 0,
      speciality: "string",
      remarks: "string",
    }
    const message = {
      message: "Permission Created",
    }
    const result = await request(app)
      .post("/api/process/create")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("(y+8).1.0 test process creation with expired token", async () => {
    const payload = {
      token: "<expired_token>",
      patientId: 0,
      therapistId: 0,
      speciality: "string",
      remarks: "string",
    }
    const message = {
      message: "Verification token invalid or expired",
    }
    const result = await request(app)
      .post("/api/process/create")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })

  it("(y+8).2.0 test process creation unsuccessfully", async () => {
    const payload = {
      token: "<auth_token>",
      patientId: 0,
      therapistId: 0,
      speciality: "string",
      remarks: "string",
    }
    const message = {
      message: "An internal error has occurred while processing the request",
    }
    const result = await request(app)
      .post("/api/process/create")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
    expect(result.body).toEqual(message)
  })
})
