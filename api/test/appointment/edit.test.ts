import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("2.6 test appointments info", () => {
  it("2.6.0 show an appointments info", async () => {
    
    const payload1 = {
      email: "sarab@student.dei.uc.pt",
      password: "password1234",
    }
    const result1 = await request(app)
      .post("/api/auth/login")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    const token = result1.body.token //set this has valid admin token
    
    const payload2 = {
      appointmentId: 0,
      appointmentRoomId: 0,
      appointmentStart: "2022-12-24T15:03:00.000Z",
      appointmentEnd: "2022-12-24T15:03:00.000Z",
    }
    
    const result2 = await request(app)
      .put("/api/appointments/edit")
      .send(payload2)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result2.status).toEqual(StatusCodes.OK)
  })

  it("2.6.1 User doesn't have authorization", async () => {

    const payload1 = {
      email: "obliquo@student.dei.uc.pt",
      password: "password1234",
    }
    const result1 = await request(app)
      .post("/api/auth/login")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    const token = result1.body.token //set this has guard token

    const payload2 = {
      appointmentId: 0,
      appointmentRoomId: 0,
      appointmentStart: "2022-12-24T15:03:00.000Z",
      appointmentEnd: "2022-12-24T15:03:00.000Z",
    }
    
    const result2 = await request(app)
      .put("/api/appointments/edit")
      .send(payload2)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result2.status).toEqual(StatusCodes.UNAUTHORIZED)
  })

  it("2.6.2 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is equivalent to expired token
    const payload = {
      appointmentId: 0,
      appointmentRoomId: 0,
      appointmentStart: "2022-12-24T15:03:00.000Z",
      appointmentEnd: "2022-12-24T15:03:00.000Z",
    }

    const result = await request(app)
      .put("/api/appointments/edit")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
  })
})
