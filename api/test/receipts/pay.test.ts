import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("5.1 test paying receipts", () => {
  it("5.1.0 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is equivalent to expired token
    const receiptId = "0"
    
    const result = await request(app)
      .put("/api/receipts/create?receiptId=" + receiptId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
  })

  it("5.1.1 User doesn't have authorization", async () => {
    
    const payload1 = {
      email: "obliquo@student.dei.uc.pt",
      password: "password1234",
    }
    const result1 = await request(app)
      .post("/api/auth/login")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    const token = result1.body.token //set this has guard token
    
    const receiptId = "0"
    
    const result2 = await request(app)
      .put("/api/receipts/create?receiptId=" + receiptId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result2.status).toEqual(StatusCodes.UNAUTHORIZED)
  })

  it("5.1.2  pay a receipt", async () => {
    
    const payload1 = {
      email: "sarab@student.dei.uc.pt",
      password: "password1234",
    }
    const result1 = await request(app)
      .post("/api/auth/login")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    const token = result1.body.token //set this has valid admin token
    
    const receiptId = "0"
    
    const result2 = await request(app)
      .put("/api/receipts/create?receiptId=" + receiptId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result2.status).toEqual(StatusCodes.OK)
  })
})
