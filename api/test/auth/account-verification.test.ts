import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("0.4 if an account is already verified", () => {
  // it("0.4.0 account verified", async () => {

  it("0.4.1 the account has already been verified", async () => {
    const payload = {
      email: "email@student.dei.uc.pt",
      callback: "http://frontend.com/verification-page",
    }

    const message = {
      message: "The user does not exist!",
    }

    const result = await request(app)
      .post("/api/auth/account-verification")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(result.body).toEqual(message)
  })
})
