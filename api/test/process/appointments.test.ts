import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("(y+5).0 test getters for listing active processes", () => {
  it("(y+5).0.0 test therapist trying to get appointments successfully", async () => {
    const payload = {
      token: "<therapist_auth_token>",
      processId: "<refCode>",
    }
    const message = {
      online: "<online_boolean>",
      start_date: "<string>",
      end_date: "<string/timestamp>",
      room: "<string>",
      type: "<string>",
    }
    const result = await request(app)
      .get("/api/process/appointments")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("(y+5).1.0 test therapist trying to get appointments without permission", async () => {
    const payload = {
      token: "<therapist_auth_token>",
      processId: "<ref_code_not_in_list>",
    }
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .get("/api/process/appointments")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })

  it("(y+5).2.0 test therapist trying to get appointments with expired token", async () => {
    const payload = {
      token: "<expired_token>",
      processId: "<refCode>",
    }
    const message = {
      message: "Verification token invalid or expired",
    }
    const result = await request(app)
      .get("/api/process/appointments")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
