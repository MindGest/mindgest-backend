import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("2.3 test listing appointment in the last 24h", () => {
  it("2.3.0 List every appointment in the last 24 hours", async () => {
    const token = "" //set this has valid admin token

    const message = {
      //define real values
      message: [
        {
          appointmentStartTime: "2022-12-24T15:03:00.000Z",
          appointmentEndTime: "2022-12-24T15:03:00.000Z",
          patients: [
            {
              name: "string",
            },
          ],
        },
      ],
    }
    const result = await request(app)
      .post("/api/appointments/listLastTerminated")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("2.3.1 User doesn't have authorization", async () => {
    const token = "" //set this has guard token
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .post("/api/appointments/listLastTerminated")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })

  it("2.3.2 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is equivalent to expired token
    const message = {
      message: "Verification token invalid or expired",
    }
    const result = await request(app)
      .post("/api/appointments/listLastTerminated")

      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
