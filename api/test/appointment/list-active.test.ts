import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("2.1 test listing active appointments", () => {
  it("2.1.0 List every active appointment", async () => {
    const token = "" //set this has valid admin token
    const payload = {
      filterId: 0,
    }

    const message = {
      //define real values
      message: [
        {
          appointmentStartTime: "2022-12-24T15:03:00.000Z",
          appointmentEndTime: "2022-12-24T15:03:00.000Z",
          appointmentRoom: "string",
          therapists: [
            {
              name: "string",
            },
          ],
          speciality: "string",
        },
      ],
    }
    const result = await request(app)
      .post("/api/appointments/list/active")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("2.1.1 User doesn't have authorization", async () => {
    const token = "" //set this has guard token
    const payload = {
      filterId: 0,
    }
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .post("/api/appointments/list/active")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })

  it("2.1.2 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is equivalent to expired token
    const payload = {
      filterId: 0,
    }
    const message = {
      message: "Verification token invalid or expired",
    }
    const result = await request(app)
      .post("/api/appointments/list/active")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
