const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'telegram-longchat-bot',
    version: '1.0.0'
  });
});

// Basic info endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Telegram LongChat Bot',
    description: 'Modular Telegram bot using LongChat API for content generation',
    endpoints: {
      health: '/health',
      status: '/status'
    },
    documentation: 'See README.md for usage instructions'
  });
});

// Status endpoint with bot info
app.get('/status', (req, res) => {
  const os = require('os');
  const process = require('process');
  
  res.json({
    status: 'running',
    uptime: process.uptime(),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: process.memoryUsage()
    },
    node: {
      version: process.version,
      platform: process.platform
    },
    timestamp: new Date().toISOString()
  });
});

// Start health check server only if not in test environment
// For PythonAnywhere/Heroku/Railway, we need the server to start when imported
if (process.env.NODE_ENV !== 'test') {
  // Check if we're in a production environment or if server should always start
  const shouldStartServer = process.env.NODE_ENV === 'production' ||
                          process.env.ALWAYS_START_SERVER === 'true' ||
                          require.main === module;
  
  if (shouldStartServer) {
    const server = app.listen(port, () => {
      console.log(`Health check server running on port ${port}`);
    });
    
    // Export server for graceful shutdown if needed
    module.exports = { app, server };
  } else {
    module.exports = { app };
  }
} else {
  module.exports = { app };
}