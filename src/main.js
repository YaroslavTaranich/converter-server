const config = require("config")
const express = require("express")
const appRouter = require("./routes")
const cors = require("cors")
const WebSocketServer = require("./ws")
const startUploadsCleaner = require("./uploads-cleaner")

const app = express()
app.use(
  cors({
    origin: config.get("HOST") + ":" + config.get("FRONT_PORT"),
  })
)

const wss = new WebSocketServer()

app.use("/api", appRouter(wss))
app.use(express.static(__dirname + "/static"))

const server = app.listen(config.get("BACK_PORT"), () => {
  console.log("Сервер запущен на порту " + config.get("BACK_PORT"))
})

server.on("upgrade", (request, socket, head) => {
  wss.wss.handleUpgrade(request, socket, head, (socket) => {
    wss.wss.emit("connection", socket, request)
  })
})

startUploadsCleaner()
