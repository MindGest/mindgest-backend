import { Router, Request, Response } from "express"

import path from "path"
import YAML from "yamljs"
import SwaggerUI from "swagger-ui-express"

// Documentation Router
const docs: Router = Router()

// Load openapi file
let document = YAML.load(path.join(__dirname, "..", "..", "assets", "documentation", "openapi.yml"))

// Routes
docs.use(
  "/",
  SwaggerUI.serve,
  SwaggerUI.setup(document, {
    explorer: true,
    customSiteTitle: "MindGest API Documentation",
    customCss: ".swagger-ui .topbar { display: none }",
  })
)

// Endpoints
docs.get("/json", (_: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json")
  res.send(document)
})

export default docs
