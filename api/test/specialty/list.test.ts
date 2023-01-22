import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("7.1 test listing specialties", () => {
  it("7.1.0 List every specialties", async () => {
    const token = "" //set this has valid admin token
    const message = {
      message: [
        {
          speciality: "Esp-A"
        }
      ]    
    }
    const result = await request(app)
      .get("/api/specialty/list")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("7.1.1 User doesn't have authorization", async () => {
    const token = "" //set this has guard token
    const processId = "0"
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .get("/api/specialty/list")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })

  it("7.1.2 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is equivalent to expired token
    const processId = "0"
    const message = {
      message: "Verification token invalid or expired",
    }
    const result = await request(app)
      .get("/api/specialty/list")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
