#!/usr/bin/env node
/**
 * PythonAnywhere startup script for Telegram LongChat Bot
 * This script ensures the HTTP server starts for PythonAnywhere's web app requirements
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Telegram LongChat Bot for PythonAnywhere...');

// Set environment variables for PythonAnywhere
process.env.NODE_ENV = 'production';
process.env.ALWAYS_START_SERVER = 'true';

// PythonAnywhere provides PORT environment variable
if (!process.env.PORT) {
  process.env.PORT = 3000;
  console.log(`⚠️  PORT not set, defaulting to ${process.env.PORT}`);
}

console.log(`📊 Environment:`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   PORT: ${process.env.PORT}`);
console.log(`   ALWAYS_START_SERVER: ${process.env.ALWAYS_START_SERVER}`);

// Check for required environment variables
const requiredEnvVars = ['BOT_TOKEN', 'LONGCHAT_API_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('   Please set these in your PythonAnywhere Web app configuration');
  console.error('   The bot will start but may not function properly');
}

// Import and start the bot
try {
  console.log('📦 Loading bot application...');
  require('./src/index.js');
  
  console.log('✅ Bot application loaded successfully');
  console.log(`🌐 Health server should be running on port ${process.env.PORT}`);
  console.log('🔗 Health check available at:');
  console.log(`   http://localhost:${process.env.PORT}/health`);
  console.log(`   http://localhost:${process.env.PORT}/`);
  
  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n👋 Received SIGINT, shutting down gracefully...');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n👋 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
  });
  
} catch (error) {
  console.error('❌ Failed to start bot application:', error);
  process.exit(1);
}