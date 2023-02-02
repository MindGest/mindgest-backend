import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("3.9 test listing notes in process", () => {
  it("3.9.0 List process notes", async () => {
    const payload = {
      email: "sarab@student.dei.uc.pt",
      password: "password1234",
    }
    const result = await request(app)
      .post("/api/auth/login")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")

    const token = result.body.token //set up an admin token
    const processId = "0"
    const message = {
      // define real values
      message: [
        {
          title: "string",
          body: "string",
          date: "string",
        },
      ],
    }
    const result1 = await request(app)
      .post("/api/process/" + processId + "/createNote")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.OK)
    expect(result1.body).toEqual(message)
  })

  it("3.9.1 User doesn't have authorization", async () => {
    const payload = {
      email: "obliquo@student.dei.uc.pt",
      password: "password1234",
    }
    const result = await request(app)
      .post("/api/auth/login")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")

    const token = result.body.token //set up an guard token
    const processId = "0"

    const result1 = await request(app)
      .post("/api/process/" + processId + "/createNote")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.UNAUTHORIZED)
  })

  it("3.9.2 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is equivalent to expired token
    const processId = "0"

    const result = await request(app)
      .post("/api/process/" + processId + "/createNote")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
  })
})
