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
    const result = await request(app)
      .post("/api/process/create")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
  })

  it("3.4.1 user unauthorized", async () => {
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
    const payload1 = {
      patientId: 0,
      therapistId: 0,
      speciality: "string",
      remarks: "string",
    }
   
    const result1 = await request(app)
      .post("/api/process/create")
      .send(payload1)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.OK)
  })

  it("3.4.2 process Created", async () => {
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
    const payload1 = {
      patientId: 0,
      therapistId: 0,
      speciality: "string",
      remarks: "string",
    }
   
    const result1 = await request(app)
      .post("/api/process/create")
      .send(payload1)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.OK)
  })
})
