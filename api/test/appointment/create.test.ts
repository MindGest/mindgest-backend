import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("2.4 test creating appointments", () => {
  it("2.4.0 creat appointment", async () => {
    const token = "" //set this has valid admin token
    const payload = {
      processId: 0,
      online: true,
      roomId: 0,
      priceTableId: 0,
      startDate: "2022-12-24T15:03:00.000Z",
      endDate: "2022-12-24T15:03:00.000Z"
    }
    
    
    const message = { //define real values
      message:  "The appointment has been successfully created."
    }
    const result = await request(app)
      .post("/api/appointments/create")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("2.4.1 User doesn't have authorization", async () => {
    const token = "" //set this has guard token
    const payload = {
      processId: 0,
      online: true,
      roomId: 0,
      priceTableId: 0,
      startDate: "2022-12-24T15:03:00.000Z",
      endDate: "2022-12-24T15:03:00.000Z"
    }
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .post("/api/appointments/create")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })

  it("2.4.2 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is equivalent to expired token
    const payload = {
      processId: 0,
      online: true,
      roomId: 0,
      priceTableId: 0,
      startDate: "2022-12-24T15:03:00.000Z",
      endDate: "2022-12-24T15:03:00.000Z"
    }
    const message = {
      message: "Verification token invalid or expired",
    }
    const result = await request(app)
      .post("/api/appointments/create")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
