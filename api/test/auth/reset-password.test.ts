import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("0.6 Test password reset", () => {
  it("0.6.0 existing user sends request to change password", async () => {
    const token = "" // need to get token here from email
    const payload = {
      token : token
    }

    const result = await request(app)
      .post("/api/auth/forgot-password")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
  })

  it("0.6.1 Password reset with invalid token", async () => {
    const payload = {
      token: "invalid token",
    }

    const message = {
      message: "Password reset token invalid or expired!",
    }

    const result = await request(app)
      .post("/api/auth/reset-password")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})

