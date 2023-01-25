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

    const message = {
      message: "Verification token invalid or expired",
    }
    const result = await request(app)
      .post("/api/specialty/create")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })

  it("7.0.1 User doesn't have authorization", async () => {
    const token = "" //set this has guard token
    const payload = {
      speciality: "Esp-A",
    }
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .post("/api/specialty/create")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })

  it("7.0.2 Specialty Created", async () => {
    const token = "" //set this has valid admin token
    const payload = {
      speciality: "Esp-A",
    }
    const message = {
      message: "The speciality has been successfully created.",
    }
    const result = await request(app)
      .post("/api/specialty/create")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })
})
