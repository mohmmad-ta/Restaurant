// wsServer.js
const WebSocket = require('ws');
const jwt = require('jsonwebtoken')
const { URL } = require('url');

let wss = null;
const userSockets = new Map();
function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    // Parse user ID from query param or JWT token
    const url = new URL(req.url, `http://${req.headers.host}`);
    console.log(url);

    const token = url.searchParams.get('token');

    console.log(token);
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // replace with real secret
      userId = decoded.id;
    } catch (err) {
      console.log('Invalid token, closing connection');
      ws.close();
      return;
    }

    // Save the socket by user ID
    userSockets.set(userId, ws);
    console.log(`User ${userId} connected`);

    ws.on('close', () => {
      userSockets.delete(userId);
      console.log(`User ${userId} disconnected`);
    });
  });
}

// Broadcast order to all connected clients
function broadcastOrder(order) {
  const message = JSON.stringify({ type: 'order', data: order });
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function sendOrderToUser(userId, order, type) {
  const ws = userSockets.get(userId);
  console.log(`Sending order to user ${userId}`, order);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: type, data: order }));
  }
}



module.exports = {
  initWebSocket,
  broadcastOrder,
  sendOrderToUser
};
