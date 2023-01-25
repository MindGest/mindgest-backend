import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("0.3 if an account is already verified", () => {
  it("0.3.0 the account has already been verified", async () => {
    const token = "" // é preciso gerar um token
    const payload = {
      token: token,
    }
    const message = {
      message: "Account [already] verified successfully!",
    }

    const result = await request(app)
      .post("/api/auth/verify-account")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("0.3.1 with invalid token", async () => {
    const payload = {
      token: "invalid token",
    }
    const message = {
      message: "Verification token invalid or expired",
    }

    const result = await request(app)
      .post("/api/auth/verify-account")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
