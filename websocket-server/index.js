const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://moisushi.se', 'https://moi-hemsida-pdp8.vercel.app'],
  credentials: true
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://moisushi.se', 'https://moi-hemsida-pdp8.vercel.app'],
    credentials: true
  },
});

// Håll koll på anslutna terminaler per plats
const connectedTerminals = new Map();
const connectionStats = {
  totalConnections: 0,
  activeConnections: 0,
  messagesSent: 0,
  lastActivity: new Date()
};

// Logging utility
const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Validera inkommande order data
const validateOrderData = (order) => {
  if (!order || typeof order !== 'object') {
    return { valid: false, error: 'Order måste vara ett objekt' };
  }
  
  if (!order.id) {
    return { valid: false, error: 'Order ID saknas' };
  }
  
  if (!order.location || !['trelleborg', 'malmo', 'ystad'].includes(order.location)) {
    return { valid: false, error: 'Giltig location saknas (trelleborg, malmo, ystad)' };
  }
  
  return { valid: true };
};

// Hantera klientanslutning
io.on('connection', (socket) => {
  connectionStats.totalConnections++;
  connectionStats.activeConnections++;
  connectionStats.lastActivity = new Date();
  
  log('info', `Terminal anslöt: ${socket.id}`);
  
  // Registrera terminal för specifik plats
  socket.on('register-terminal', (data) => {
    const { location, terminalId } = data;
    
    if (!location || !['trelleborg', 'malmo', 'ystad'].includes(location)) {
      socket.emit('error', { message: 'Giltig location krävs för registrering' });
      return;
    }
    
    // Lägg till terminal i map
    if (!connectedTerminals.has(location)) {
      connectedTerminals.set(location, new Set());
    }
    
    connectedTerminals.get(location).add(socket.id);
    socket.location = location;
    socket.terminalId = terminalId;
    
    log('info', `Terminal registrerad för ${location}:`, { socketId: socket.id, terminalId });
    
    // Skicka bekräftelse
    socket.emit('registration-confirmed', { 
      location, 
      terminalId,
      connectedTerminals: connectedTerminals.get(location).size
    });
  });
  
  // Hantera frånkoppling
  socket.on('disconnect', () => {
    connectionStats.activeConnections--;
    
    if (socket.location && connectedTerminals.has(socket.location)) {
      connectedTerminals.get(socket.location).delete(socket.id);
      
      // Ta bort location från map om inga terminaler är anslutna
      if (connectedTerminals.get(socket.location).size === 0) {
        connectedTerminals.delete(socket.location);
      }
    }
    
    log('info', `Terminal frånkopplad: ${socket.id} (${socket.location || 'oregistrerad'})`);
  });
  
  // Hantera ping för att hålla anslutningen vid liv
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });
});

// API-endpoint för att skicka ny order
app.post('/send-order', (req, res) => {
  const order = req.body;
  
  // Validera order data
  const validation = validateOrderData(order);
  if (!validation.valid) {
    return res.status(400).json({ 
      success: false, 
      error: validation.error 
    });
  }
  
  connectionStats.messagesSent++;
  connectionStats.lastActivity = new Date();
  
  const location = order.location;
  const connectedCount = connectedTerminals.get(location)?.size || 0;
  
  log('info', `Skickar order ${order.id} till ${location}:`, { 
    connectedTerminals: connectedCount,
    orderTotal: order.total_amount 
  });
  
  // Skicka till alla terminaler för denna plats
  if (connectedTerminals.has(location)) {
    connectedTerminals.get(location).forEach(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('new-order', {
          ...order,
          timestamp: new Date().toISOString(),
          serverTime: Date.now()
        });
      }
    });
  }
  
  res.json({ 
    success: true, 
    location,
    connectedTerminals: connectedCount,
    messageId: `order-${order.id}-${Date.now()}`
  });
});

// API-endpoint för att skicka ny bokning
app.post('/send-booking', (req, res) => {
  const booking = req.body;
  
  if (!booking || !booking.id || !booking.location) {
    return res.status(400).json({ 
      success: false, 
      error: 'Bokning ID och location krävs' 
    });
  }
  
  connectionStats.messagesSent++;
  connectionStats.lastActivity = new Date();
  
  const location = booking.location;
  const connectedCount = connectedTerminals.get(location)?.size || 0;
  
  log('info', `Skickar bokning ${booking.id} till ${location}:`, { 
    connectedTerminals: connectedCount,
    bookingTime: booking.booking_time 
  });
  
  // Skicka till alla terminaler för denna plats
  if (connectedTerminals.has(location)) {
    connectedTerminals.get(location).forEach(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('new-booking', {
          ...booking,
          timestamp: new Date().toISOString(),
          serverTime: Date.now()
        });
      }
    });
  }
  
  res.json({ 
    success: true, 
    location,
    connectedTerminals: connectedCount,
    messageId: `booking-${booking.id}-${Date.now()}`
  });
});

// API-endpoint för att skicka status uppdateringar
app.post('/send-status-update', (req, res) => {
  const { orderId, status, location } = req.body;
  
  if (!orderId || !status || !location) {
    return res.status(400).json({ 
      success: false, 
      error: 'Order ID, status och location krävs' 
    });
  }
  
  connectionStats.messagesSent++;
  connectionStats.lastActivity = new Date();
  
  const connectedCount = connectedTerminals.get(location)?.size || 0;
  
  log('info', `Skickar status uppdatering för order ${orderId}:`, { 
    status,
    location,
    connectedTerminals: connectedCount 
  });
  
  // Skicka till alla terminaler för denna plats
  if (connectedTerminals.has(location)) {
    connectedTerminals.get(location).forEach(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('order-status-update', {
          orderId,
          status,
          location,
          timestamp: new Date().toISOString(),
          serverTime: Date.now()
        });
      }
    });
  }
  
  res.json({ 
    success: true, 
    location,
    connectedTerminals: connectedCount,
    messageId: `status-${orderId}-${Date.now()}`
  });
});

// Hälsostatus endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    connections: connectionStats,
    connectedTerminals: Array.from(connectedTerminals.entries()).map(([location, terminals]) => ({
      location,
      count: terminals.size
    })),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Stats endpoint
app.get('/stats', (req, res) => {
  res.json({
    ...connectionStats,
    connectedTerminals: Array.from(connectedTerminals.entries()).map(([location, terminals]) => ({
      location,
      count: terminals.size,
      socketIds: Array.from(terminals)
    })),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API-endpoint för att skicka print-events
app.post('/send-print-event', (req, res) => {
  const printEvent = req.body;
  
  if (!printEvent || !printEvent.order_id || !printEvent.location) {
    return res.status(400).json({ 
      success: false, 
      error: 'Print event, order ID och location krävs' 
    });
  }
  
  connectionStats.messagesSent++;
  connectionStats.lastActivity = new Date();
  
  const location = printEvent.location;
  const connectedCount = connectedTerminals.get(location)?.size || 0;
  
  log('info', `Skickar print-event för order ${printEvent.order_number} till ${location}:`, { 
    connectedTerminals: connectedCount,
    printedBy: printEvent.printed_by 
  });
  
  // Skicka till alla terminaler för denna plats
  if (connectedTerminals.has(location)) {
    connectedTerminals.get(location).forEach(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('print-event', {
          ...printEvent,
          timestamp: new Date().toISOString(),
          serverTime: Date.now()
        });
      }
    });
  }
  
  res.json({ 
    success: true, 
    location,
    connectedTerminals: connectedCount,
    messageId: `print-${printEvent.order_id}-${Date.now()}`
  });
});

// API-endpoint för att skicka print-commands till alla terminaler
app.post('/send-print-command', (req, res) => {
  const { data } = req.body;
  
  if (!data || !data.order || !data.order.location) {
    return res.status(400).json({ 
      success: false, 
      error: 'Print command med order och location krävs' 
    });
  }
  
  const { order, printer_ip, printer_port, initiated_by, initiated_from } = data;
  const location = order.location;
  
  connectionStats.messagesSent++;
  connectionStats.lastActivity = new Date();
  
  const connectedCount = connectedTerminals.get(location)?.size || 0;
  
  log('info', `Broadcasting print-command för order ${order.order_number} till ${location}:`, { 
    connectedTerminals: connectedCount,
    initiatedBy: initiated_by,
    initiatedFrom: initiated_from,
    printerIP: printer_ip,
    printerPort: printer_port
  });
  
  // Broadcast to all terminals for this location
  if (connectedTerminals.has(location)) {
    connectedTerminals.get(location).forEach(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('print-command', {
          order,
          printer_ip,
          printer_port,
          initiated_by,
          initiated_from,
          timestamp: new Date().toISOString(),
          serverTime: Date.now()
        });
      }
    });
  }
  
  res.json({ 
    success: true, 
    location,
    connectedTerminals: connectedCount,
    messageId: `print-command-${order.id}-${Date.now()}`
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'WebSocket server körs!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  log('info', 'Stänger av WebSocket server...');
  server.close(() => {
    log('info', 'WebSocket server stängd');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  log('info', `WebSocket server körs på port ${PORT}`);
  log('info', `Hälsostatus: http://localhost:${PORT}/health`);
  log('info', `Statistik: http://localhost:${PORT}/stats`);
}); 