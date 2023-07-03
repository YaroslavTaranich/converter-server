const WebSocket = require("ws")

class WebSocketServer {
  constructor() {
    this.wss = new WebSocket.Server({ noServer: true })
    this.clients = new Map()
    this.wss.on("connection", (ws) => {
      ws.on("message", (json) => {
        const data = JSON.parse(json)
        console.log(data)

        if ("clientId" in data) {
          this.clients.set(data.clientId, ws)
        }
      })

      console.log("connected clients: ", this.clients.keys())

      ws.on("close", () => {
        const id = this.clients.has(ws)
        this.clients.delete(id)
      })
    })
  }

  getClient(clientId) {
    return this.clients.get(clientId)
  }

  sendProgress(progress, clientId) {
    const wsClient = this.getClient(clientId)
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      wsClient.send(JSON.stringify({ clientId, progress }))
    }
  }

  sendLink(downloadLink, clientId) {
    const wsClient = this.getClient(clientId)
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      wsClient.send(JSON.stringify({ clientId, downloadLink }))
    }
  }

  sendError(message, clientId) {
    const wsClient = this.getClient(clientId)
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      wsClient.send(JSON.stringify({ clientId, error: message }))
    }
  }

  removeClient(clientId) {
    return this.clients.delete(clientId)
  }
}

module.exports = WebSocketServer;
