import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("3.5 test process edit", () => {
  it("3.5.0 test process edit successfully", async () => {
    const token = "" //set this is has valid admin token
    const payload = {
      therapistId: 0,
      speciality: "",
      remarks: "this is just a test",
      colaborators: [0],
    }
    const message = {
      message: "Process Edited",
    }
    const result = await request(app)
      .post("/api/process/edit")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("3.5.1 test process edit without permission", async () => {
    const token = "" //set this is has valid intern token
    const payload = {
      therapistId: 0,
      speciality: "",
      remarks: "this is just a test",
      colaborators: [0],
    }
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .post("/api/process/edit")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })

  it("3.5.2 test process edit with expired token", async () => {
    const token = "invalid token" //this is the same as having an expired token
    const payload = {
      therapistId: 0,
      speciality: "",
      remarks: "Verification token invalid or expired",
      colaborators: [0],
    }
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .post("/api/process/edit")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
