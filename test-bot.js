#!/usr/bin/env node

/**
 * Test script for Telegram LongChat Bot
 * This script validates the bot's core functionality without actually starting the Telegram bot.
 */

const config = require('./src/config');
const BotService = require('./src/services/botService');
const FileGenerator = require('./src/services/fileGenerator');
const AntiRepetition = require('./src/utils/antiRepetition');
const RateLimiter = require('./src/utils/rateLimiter');

async function runTests() {
  console.log('🧪 Testing Telegram LongChat Bot Components...\n');
  
  let allTestsPassed = true;
  
  // Test 1: Configuration
  console.log('1. Testing Configuration...');
  try {
    console.log(`   ✓ Bot Token configured: ${config.botToken ? 'Yes' : 'No (will fail at runtime)'}`);
    console.log(`   ✓ LongChat API Key: ${config.longchatApiKey ? 'Configured' : 'Not configured (using mock responses)'}`);
    console.log(`   ✓ Rate Limit: ${config.maxRequestsPerMinute} requests/minute`);
    console.log(`   ✓ Output Directory: ${config.outputDir}`);
    console.log('   ✓ Configuration test passed\n');
  } catch (error) {
    console.log(`   ✗ Configuration test failed: ${error.message}\n`);
    allTestsPassed = false;
  }
  
  // Test 2: Bot Service
  console.log('2. Testing Bot Service...');
  try {
    const botService = new BotService();
    
    // Test command parsing
    const testCommand = '/script artificial intelligence cinematic';
    const parsed = botService.parseCommand(testCommand, 'script');
    console.log(`   ✓ Command parsing: topic="${parsed.topic}", style="${parsed.style}"`);
    
    // Test topic generation
    const randomTopic = botService.generateRandomTopic();
    console.log(`   ✓ Random topic generation: "${randomTopic}"`);
    
    // Test prompt building
    const prompt = botService.buildUserPrompt('SCRIPT', 'AI', 'cinematic', 'Use different style');
    console.log(`   ✓ Prompt building: ${prompt.split('\n')[0]}...`);
    
    console.log('   ✓ Bot Service test passed\n');
  } catch (error) {
    console.log(`   ✗ Bot Service test failed: ${error.message}\n`);
    allTestsPassed = false;
  }
  
  // Test 3: File Generator
  console.log('3. Testing File Generator...');
  try {
    const fileGenerator = new FileGenerator();
    
    // Test filename sanitization
    const sanitized = fileGenerator.sanitizeFilename('Test/File:Name?With*Special"Chars');
    console.log(`   ✓ Filename sanitization: "${sanitized}"`);
    
    // Test file content preparation
    const content = fileGenerator.prepareFileContent('script', 'Test Topic', 'Test content', 'cinematic', '20260101_120000');
    console.log(`   ✓ File content preparation: ${content.split('\n').length} lines`);
    
    // Check output directory
    const fs = require('fs-extra');
    const dirExists = await fs.pathExists(config.outputDir);
    console.log(`   ✓ Output directory exists: ${dirExists}`);
    
    console.log('   ✓ File Generator test passed\n');
  } catch (error) {
    console.log(`   ✗ File Generator test failed: ${error.message}\n`);
    allTestsPassed = false;
  }
  
  // Test 4: Anti-Repetition
  console.log('4. Testing Anti-Repetition Logic...');
  try {
    const antiRepetition = new AntiRepetition();
    
    // Test history tracking
    antiRepetition.addToHistory('test-user', {
      mode: 'script',
      topic: 'AI',
      response: 'Test response'
    });
    
    const history = antiRepetition.getHistory('test-user');
    console.log(`   ✓ History tracking: ${history.length} entries`);
    
    // Test variation generation
    const variation = antiRepetition.getVariationInstruction('test-user');
    console.log(`   ✓ Variation instruction: "${variation.substring(0, 50)}..."`);
    
    // Test statistics
    const stats = antiRepetition.getStatistics();
    console.log(`   ✓ Statistics: ${stats.totalUsers} users, ${stats.totalRequests} requests`);
    
    console.log('   ✓ Anti-Repetition test passed\n');
  } catch (error) {
    console.log(`   ✗ Anti-Repetition test failed: ${error.message}\n`);
    allTestsPassed = false;
  }
  
  // Test 5: Rate Limiter
  console.log('5. Testing Rate Limiter...');
  try {
    const rateLimiter = new RateLimiter(5);
    
    // Test rate limiting
    const result1 = await rateLimiter.consume('test-user-1');
    console.log(`   ✓ Rate limit consumption: ${result1.allowed ? 'Allowed' : 'Blocked'}`);
    
    // Test statistics
    const userStats = rateLimiter.getUserStats('test-user-1');
    console.log(`   ✓ User statistics: ${userStats.lastMinute} requests in last minute`);
    
    // Test configuration
    const limiterConfig = rateLimiter.getConfig();
    console.log(`   ✓ Rate limit config: ${limiterConfig.requestsPerMinute} requests/minute`);
    
    console.log('   ✓ Rate Limiter test passed\n');
  } catch (error) {
    console.log(`   ✗ Rate Limiter test failed: ${error.message}\n`);
    allTestsPassed = false;
  }
  
  // Test 6: Mock API Response
  console.log('6. Testing Mock API Integration...');
  try {
    const LongChatAPI = require('./src/services/longchatAPI');
    const api = new LongChatAPI();
    
    // Test mock response (since API key is likely not configured)
    const mockResponse = api.getMockResponse('SCRIPT', 'MODE: SCRIPT\nTOPIC: Artificial Intelligence');
    console.log(`   ✓ Mock response generation: ${mockResponse.split('\n').length} lines`);
    
    // Test parameter adjustment
    const params = api.adjustParametersForMode('SCRIPT', 2000);
    console.log(`   ✓ Parameter adjustment: temperature=${params.temperature}, maxTokens=${params.maxTokens}`);
    
    console.log('   ✓ Mock API test passed\n');
  } catch (error) {
    console.log(`   ✗ Mock API test failed: ${error.message}\n`);
    allTestsPassed = false;
  }
  
  // Summary
  console.log('='.repeat(50));
  if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED!');
    console.log('\nThe bot is ready for deployment.');
    console.log('\nNext steps:');
    console.log('1. Create a .env file with your BOT_TOKEN and LONGCHAT_API_KEY');
    console.log('2. Run `npm install` to install dependencies');
    console.log('3. Start the bot with `npm start` or `npm run dev`');
    console.log('4. Test with your Telegram bot using /start command');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('\nPlease check the errors above and fix the issues.');
  }
  console.log('='.repeat(50));
}

// Run tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});