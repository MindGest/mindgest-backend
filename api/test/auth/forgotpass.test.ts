import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("2.0 forgot password and user exists", () => {
  it("2.0.0 existing user sends request to change password", async () => {
    const payload = {
      email: "johndoe@student.dei.uc.pt",
      callback: "http://frontend.com/password-reset-page",
    }

    const result = await request(app)
      .post("/api/auth/forgot-password")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    // falta o código de sucesso na documentação então não sei o que esperar
  })
})

describe("2.1 forgot password and user doesn't exist", () => {
  it("2.1.0 user is not in the database so it cannot recover password", async () => {
    const payload = {
      email: "john@student.dei.uc.pt",
      callback: "http://frontend.com/password-reset-page",
    }
    const message = {
      message: "The user does not exist!",
    }
    const result = await request(app)
      .post("/api/auth/forgot-password")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(result.body).toEqual(message)
  })
})