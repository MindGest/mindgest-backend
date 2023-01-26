import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("7.0 test creating specialties", () => {
  it("7.0.0 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is equivalent to expired token
    const payload = {
      speciality: "Esp-A",
    }

    const result = await request(app)
      .post("/api/specialty/create")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
  })

  it("7.0.1 User doesn't have authorization", async () => {
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

    const payload = {
      speciality: "Esp-A",
    }

    const result2 = await request(app)
      .post("/api/specialty/create")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result2.status).toEqual(StatusCodes.UNAUTHORIZED)
  })

  it("7.0.2 Specialty Created", async () => {
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

    const payload = {
      speciality: "Esp-A",
    }

    const result2 = await request(app)
      .post("/api/specialty/create")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result2.status).toEqual(StatusCodes.OK)
  })
})
