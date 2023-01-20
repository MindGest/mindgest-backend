import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"
import { TokenExpiredError } from "jsonwebtoken"

describe("3.6 test getting all appointments of a process", () => {
  it("3.6.0 All appointments from a process", async () => {
    const token = "" //set this is has valid admin token
    const processId = "0"
    const message = { // set realistic values
      online: "<online_boolean>", 
      start_date: "<string>",
      end_date: "<string/timestamp>",
      room: "<string>",
      type: "<string>",
    }
    const result = await request(app)
      .get("/api/process/appointments?processId=" + processId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("3.6.1 test therapist trying to get appointments without permission", async () => {
    const token = "" //set this is has valid intern token
    const processId = "0"
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .get("/api/process/appointments?processId=" + processId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })

  it("3.6.2 test therapist trying to get appointments with expired token", async () => {
    const token = "invalid token" //this is equivalent to an expired token
    const processId = "0"
    const message = {
      message: "Verification token invalid or expired",
    }
    const result = await request(app)
      .get("/api/process/appointments?processId=" + processId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
