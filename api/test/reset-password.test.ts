import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../src/main"

describe("Test password reset", () => {

    /* missing token - i don't know hoe to generate
    it("(x+1).0 test - token is valid", async () => {

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

    it("(x+1).1 test - token is invalid", async () => {

        const payload = {
            "token": "eyJVCJ9OiJIUzI1NiIsInR5cCI6IeyJwkpXc3Npb24iO00iaXAiOiI6OjEiLCJ1c2VyQWdlbnQiOiJQb3N0bWFuUnVudGltZS83LjI5LjIifSwiaWF0IjoxNjY5MDY4MDYxLCJleHAiOjE2NjkwNzE2.ZXJzb24iOjIsInNlhbGciNjF9.9ydDW20vY2gGc43q86gsfsyEQOiSQkabb8xkmI91QhQ"
        }
        
        // in json format
        const message = {
            message: "Password reset token invalid or expired!"
        }
          
        const result = await request(app)
          .post("/api/auth/register")
          .send(payload)
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
        expect(result.status).toEqual(StatusCodes.FORBIDDEN)
        expect(result.body).toEqual(message)
    })
})