import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("3.4 test process creation", () => {
  it("3.4.0 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is the same as having an expired token
    const payload = {
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
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })

  it("3.4.1 process Created", async () => {
    const token = "" //set this is has valid admin token
    const payload = {
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
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })
})
