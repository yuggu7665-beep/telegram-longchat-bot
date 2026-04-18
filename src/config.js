const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const config = {
  // Telegram Bot
  botToken: process.env.BOT_TOKEN,
  
  // LongChat API
  longchatApiKey: process.env.LONGCHAT_API_KEY,
  longchatApiUrl: process.env.LONGCHAT_API_URL || 'https://api.longchat.ai/v1/chat/completions',
  
  // Rate limiting
  maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 5,
  maxHistoryStorage: parseInt(process.env.MAX_HISTORY_STORAGE) || 10,
  
  // File system
  outputDir: process.env.OUTPUT_DIR || path.join(__dirname, '..', 'outputs'),
  
  // Modes configuration
  modes: {
    script: {
      name: 'SCRIPT',
      fileOutput: true,
      extension: '.txt'
    },
    shorts: {
      name: 'SHORTS',
      fileOutput: true,
      extension: '.txt'
    },
    title: {
      name: 'TITLE',
      fileOutput: false
    },
    thumbnail: {
      name: 'THUMBNAIL',
      fileOutput: false
    },
    seo: {
      name: 'SEO',
      fileOutput: false
    },
    idea: {
      name: 'IDEA',
      fileOutput: false
    }
  },
  
  // System prompt (MASTER SYSTEM PROMPT)
  systemPrompt: `You are a professional content creator and scriptwriter specializing in engaging, viral content.
Your task is to generate high-quality content based on the given MODE and TOPIC.

GUIDELINES:
1. Always maintain a professional yet engaging tone
2. Structure content appropriately for the requested format
3. Include relevant details, examples, and actionable insights
4. Ensure content is original and creative
5. Adapt to any specified STYLE parameters

Output should be clear, well-formatted, and ready for immediate use.`,
  
  // Style parameters
  styles: {
    cinematic: "Use cinematic language with vivid descriptions, dramatic pacing, and visual storytelling techniques.",
    mystery: "Create suspense and intrigue with unanswered questions, cliffhangers, and enigmatic elements.",
    philosophical: "Explore deeper meanings, existential questions, and abstract concepts with thoughtful analysis."
  }
};

// Validate required configuration
if (!config.botToken) {
  console.error('ERROR: BOT_TOKEN is required in .env file');
  process.exit(1);
}

if (!config.longchatApiKey) {
  console.warn('WARNING: LONGCHAT_API_KEY is not set. API calls will fail.');
}

module.exports = config;