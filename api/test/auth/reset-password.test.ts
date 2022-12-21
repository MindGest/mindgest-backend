import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("(3.0 Test password reset", () => {
  it("3.0.0 existing user sends request to change password", async () => {
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

  //need to save this token and use it on the next one

  /* missing token - i don't know how to generate
    it("3.0.1 test - token is valid", async () => {

        const payload = {
            "token": "token_gerado"
        }
        
        // in json format
        const message = {
            message: "Password Reset Successful!"
        }
          
        const result = await request(app)
          .post("/api/auth/register")
          .send(payload)
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
        expect(result.status).toEqual(StatusCodes.OK)
        expect(result.body).toEqual(message)
    })*/
})

describe("(3.1 Test password reset with an invalid token", () => {
  it("3.1.0 Password reset with invalid token", async () => {
    const payload = {
      token: "invalid token",
    }

    // in json format
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
