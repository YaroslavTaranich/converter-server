const express = require("express")
const router = express.Router()
const convertationRouter = require("./convertation-router")

const createRouter = (ws) => {
  router.use("/convertation", convertationRouter(ws))
  return router
}

module.exports = createRouter
