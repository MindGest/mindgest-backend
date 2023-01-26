import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"
import { TokenExpiredError } from "jsonwebtoken"

describe("3.6 test getting all appointments of a process", () => {
  it("3.6.0 All appointments from a process", async () => {
    const payload = {
      email: "sarab@student.dei.uc.pt",
      password: "password1234",
    }
    const result = await request(app)
      .post("/api/auth/login")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")

    const token = result.body.token //set up an admin token
    const processId = "0"
    const message = {
      // set realistic values
      online: "<online_boolean>",
      start_date: "<string>",
      end_date: "<string/timestamp>",
      room: "<string>",
      type: "<string>",
    }
    const result1 = await request(app)
      .get("/api/process/appointments?processId=" + processId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.OK)
    expect(result1.body).toEqual(message)
  })

  it("3.6.1 test therapist trying to get appointments without permission", async () => {
    const payload = {
      email: "mmenezes@student.dei.uc.pt",
      password: "password1234",
    }
    const result = await request(app)
      .post("/api/auth/login")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")

    const token = result.body.token //set up an intern token
    const processId = "0"
    
    const result1 = await request(app)
      .get("/api/process/appointments?processId=" + processId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.UNAUTHORIZED)
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
