import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("3.5 test process edit", () => {
  it("3.5.0 test process edit successfully", async () => {
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
    const payload1 = {
      therapistId: 0,
      speciality: "",
      remarks: "this is just a test",
      colaborators: [0],
    }
    const result1 = await request(app)
      .post("/api/process/edit")
      .send(payload1)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.OK)
  })

  it("3.5.1 test process edit without permission", async () => {
    const payload = {
      email: "mmenezes@student.dei.uc.pt",
      password: "password1234",
    }
    const result = await request(app)
      .post("/api/auth/login")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")

    const token = result.body.token //set up an intern token
    const payload1 = {
      therapistId: 0,
      speciality: "",
      remarks: "this is just a test",
      colaborators: [0],
    }

    const result1 = await request(app)
      .post("/api/process/edit")
      .send(payload1)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.UNAUTHORIZED)
  })

  it("3.5.2 test process edit with expired token", async () => {
    const token = "invalid token" //this is the same as having an expired token
    const payload = {
      therapistId: 0,
      speciality: "",
      remarks: "Verification token invalid or expired",
      colaborators: [0],
    }

    const result = await request(app)
      .post("/api/process/edit")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
  })
})
