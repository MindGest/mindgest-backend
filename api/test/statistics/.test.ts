import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("6.0 test statistics", () => {
  it("6.0.0  list statistics", async () => {
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

    const message = {
      // set realistic data
      message: {
        totalAppointments: 0,
        specialitiesAppointments: [
          {
            speciality: "string",
            total: 0,
          },
        ],
        processAppointments: [
          {
            processId: "string",
            total: 0,
          },
        ],
        therapistsApointments: [
          {
            therapist: "string",
            total: 0,
          },
        ],
      },
    }

    const result2 = await request(app)
      .get("/api/statistics")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result2.status).toEqual(StatusCodes.OK)
    expect(result2.body).toEqual(message)
  })

  it("6.0.1 User doesn't have authorization", async () => {
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

    const result2 = await request(app)
      .get("/api/statistics")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result2.status).toEqual(StatusCodes.UNAUTHORIZED)
  })

  it("6.0.2 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is equivalent to expired token

    const result = await request(app)
      .get("/api/statistics")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
  })
})
