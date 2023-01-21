import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("2.6 test appointments info", () => {
  it("2.6.0 show an appointments info", async () => {
    const token = "" //set this has valid admin token
    const payload = {
      appointmentId: 0,
      appointmentRoomId: 0,
      appointmentStart: "2022-12-24T15:03:00.000Z",
      appointmentEnd: "2022-12-24T15:03:00.000Z"
    }  
    const message = { //define real values
      message:  "The appointment has been successfully archived."
    }
    const result = await request(app)
      .put("/api/appointments/edit")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("2.6.1 User doesn't have authorization", async () => {
    const token = "" //set this has guard token
    const payload = {
      appointmentId: 0,
      appointmentRoomId: 0,
      appointmentStart: "2022-12-24T15:03:00.000Z",
      appointmentEnd: "2022-12-24T15:03:00.000Z"
    }
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .put("/api/appointments/edit")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })

  it("2.6.2 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is equivalent to expired token
    const payload = {
      appointmentId: 0,
      appointmentRoomId: 0,
      appointmentStart: "2022-12-24T15:03:00.000Z",
      appointmentEnd: "2022-12-24T15:03:00.000Z"
    }
    const message = {
      message: "The appointment has been successfully updated."
    }

    const result = await request(app)
      .put("/api/appointments/edit")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
