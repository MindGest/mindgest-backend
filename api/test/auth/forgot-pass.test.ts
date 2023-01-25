import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("0.5 forgot password and user exists", () => {
  it("0.5.0 user is not in the database so it cannot recover password", async () => {
    const payload = {
      email: "email@student.dei.uc.pt",
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
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })

  it("0.5.1 existing user sends request to change password", async () => {
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
