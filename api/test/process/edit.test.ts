import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("(y+4).0 test process edit", () => {

  it("(y+4).0.0 test process edit successfully", async () => {
    const payload = {
        token: "<therapist_auth_token>",
        therapistId: 0,
        speciality: "",
        remarks: "this is just a test",
        colaborators: [
          0
        ]
      
    }
    const message = {
        message: "Process Edited"
    }
    const result = await request(app)
      .post("/api/process/edit")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("(y+4).1.0 test process edit without permission", async () => {
    const payload = {
        token: "<therapist_auth_token>",
        therapistId: 0,
        speciality: "",
        remarks: "this is just a test",
        colaborators: [
          0
        ]
      
    }
    const message = {
        message: "User doesn't have authorization"
    }
    const result = await request(app)
      .post("/api/process/edit")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })

  it("(y+4).2.0 test process edit with expired token", async () => {
    const payload = {
        token: "<expired_token>",
        therapistId: 0,
        speciality: "",
        remarks: "Verification token invalid or expired",
        colaborators: [
          0
        ]
      
    }
    const message = {
        message: "User doesn't have authorization"
    }
    const result = await request(app)
      .post("/api/process/edit")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
