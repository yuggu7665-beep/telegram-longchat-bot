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
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  app.listen(port, () => {
    console.log(`Health check server running on port ${port}`);
  });
}

module.exports = app;