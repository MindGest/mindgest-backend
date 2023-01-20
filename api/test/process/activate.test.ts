import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("3.3 activating a processes", () => {
  it("3.3.0 User doesn't have authorization", async () => {
    const token = "" //set up an intern token
    const processId = "0"
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .post("/api/process/activate?processId=" + processId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })

  it("3.3.1 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is the same as having an expired token
    const processId = "0"

    const message = {
      message: "Verification token invalid or expired",
    }

    const result = await request(app)
      .post("/api/process/activate?processId=" + processId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })

  it("3.3.2 ativar um processo já existente", async () => {
    const token = "" //set up an admin token
    const processId = "0"

    const message = {
      message: "Process Activated",
    }

    const result = await request(app)
      .post("/api/process/activate?processId=" + processId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })
})
