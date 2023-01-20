import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"


describe("3.0 archive a process", () => {
  it("3.0.0 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is the same as having an expired token
    const processId = "0"
    const message = {
      message: "Verification token invalid or expired",
    }
    const result = await request(app)
      .post("/api/process/archive?processId=" + processId)
      .set("Authorization", token)    
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })

  it("3.0.1 Process Archived", async () => {
    const token = "" //set this is has valid admin token
    const processId = "0"
    const message = {
      message: "Process Archived",
    }
    const result = await request(app)
      .post("/api/process/archive?processId=" + processId)
      .set("Authorization", token)    
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })
})
