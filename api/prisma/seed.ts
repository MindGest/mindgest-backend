import development from "./src/seed.dev"
import tests from "./src/seed.tests"
import production from "./src/seed.prod"

switch (process.env.NODE_ENV) {
  // Dev Environment (npm run dev)
  case "development":
    development.seed()
    break
  // Testing Environment (npm test)
  case "test":
    tests.seed()
    break
  // Production Environment (npm run build && npm start)
  default:
    production.seed()
}
