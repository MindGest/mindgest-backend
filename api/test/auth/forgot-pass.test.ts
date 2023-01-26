import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("0.5 test forgot password", () => {
  it("0.5.0 user is not in the database so it cannot recover password", async () => {
    const payload = {
      email: "email@student.dei.uc.pt",
    } // no callback so token comes in body and is not sent by email
    
    const result = await request(app)
      .post("/api/auth/forgot-password")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.NOT_FOUND)
  })

  it("0.5.1 existing user sends request to change password", async () => {
    const payload = {
      email: "sarab@student.dei.uc.pt",
    } //no callback so token comes in body and is not sent by email

    const result = await request(app)
      .post("/api/auth/forgot-password")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
  })
})
