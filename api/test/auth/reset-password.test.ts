import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("0.6 Test password reset", () => {
  it("0.6.0 existing user sends request to change password", async () => {
    const payload = {
      email: "sarab@student.dei.uc.pt",
    } //no callback so token comes in body and is not sent by email

    const result = await request(app)
      .post("/api/auth/forgot-password")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")

    const token = result.body.token // need to get token here from email
    const payload1 = {
      token: token,
      password: "password1234",
      confirm: "password1234"
    }

    const result1 = await request(app)
      .post("/api/auth/forgot-password")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.OK)
  })

  it("0.6.1 Password reset with invalid token", async () => {
    const payload = {
      token: "invalid token",
      password: "password1234",
      confirm: "password1234"
    }
    
    const result = await request(app)
      .post("/api/auth/reset-password")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
  })
})
