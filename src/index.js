const { Telegraf } = require('telegraf');
const config = require('./config');
const BotService = require('./services/botService');
const CommandHandler = require('./handlers/commandHandler');
const RateLimiter = require('./utils/rateLimiter');

// Conditionally load health server (may fail if express not installed)
let healthServer = null;
let healthApp = null;
try {
  const healthModule = require('./health');
  healthServer = healthModule.server || null;
  healthApp = healthModule.app || healthModule;
  console.log('✅ Health server module loaded');
  if (healthServer) {
    console.log('   Health server is running on port', process.env.PORT || 3000);
  }
} catch (error) {
  console.warn('⚠️  Health server not available:', error.message);
  console.warn('   Express module may not be installed. Health endpoints disabled.');
}

class TelegramBot {
  constructor() {
    // Check if bot token is configured
    if (!config.botToken || config.botToken === 'dummy_token_for_testing') {
      console.error('❌ BOT_TOKEN is not properly configured.');
      console.error('   Please set BOT_TOKEN environment variable.');
      console.error('   Get token from @BotFather on Telegram.');
      
      // In production, we might want to exit, but for Railway we should
      // keep the container running and wait for configuration
      if (config.isProduction) {
        console.error('   Container will remain running but bot will not start.');
        this.bot = null;
        return;
      }
    }
    
    try {
      this.bot = new Telegraf(config.botToken);
      this.botService = new BotService();
      this.commandHandler = new CommandHandler(this.botService);
      this.rateLimiter = new RateLimiter(config.maxRequestsPerMinute);
      
      this.setupMiddlewares();
      this.setupCommands();
      this.setupErrorHandling();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Telegram bot:', error.message);
      this.bot = null;
      this.isInitialized = false;
    }
  }

  setupMiddlewares() {
    // Rate limiting middleware
    this.bot.use(async (ctx, next) => {
      const userId = ctx.from?.id;
      if (!userId) return next();
      
      try {
        await this.rateLimiter.consume(userId.toString());
        return next();
      } catch (error) {
        if (error.msBeforeNext) {
          const seconds = Math.ceil(error.msBeforeNext / 1000);
          await ctx.reply(`⏳ Rate limit exceeded. Please wait ${seconds} seconds before making another request.`);
        }
        return;
      }
    });

    // Logging middleware
    this.bot.use(async (ctx, next) => {
      const userId = ctx.from?.id;
      const username = ctx.from?.username;
      const command = ctx.message?.text?.split(' ')[0];
      
      console.log(`[${new Date().toISOString()}] User: ${username || userId} | Command: ${command || 'N/A'}`);
      return next();
    });
  }

  setupCommands() {
    // Start command
    this.bot.start((ctx) => {
      const welcomeMessage = `🤖 Welcome to Content Creator Bot!

Available Commands:
/start - Show this welcome message
/help - Show all commands with examples

Content Generation:
/script <topic> [style] - Generate a full script
/shorts <topic> [style] - Generate shorts/reels script
/title <topic> - Generate engaging titles
/thumbnail <topic> - Generate thumbnail ideas
/seo <topic> - Generate SEO optimization tips
/idea - Get random content ideas

Examples:
/script artificial intelligence cinematic
/shorts climate change
/title future of education

📝 Note: You can add style parameters like 'cinematic', 'mystery', or 'philosophical' to /script and /shorts commands.`;
      
      ctx.reply(welcomeMessage);
    });

    // Help command
    this.bot.help((ctx) => {
      const helpMessage = `📚 COMMAND REFERENCE

1. /script <topic> [style]
   Generates a complete video script.
   Example: /script "AI in healthcare" cinematic

2. /shorts <topic> [style]
   Generates a short-form content script.
   Example: /shorts "quantum computing"

3. /title <topic>
   Generates 5 engaging title options.
   Example: /title "renewable energy"

4. /thumbnail <topic>
   Suggests thumbnail design ideas.
   Example: /thumbnail "space exploration"

5. /seo <topic>
   Provides SEO optimization tips.
   Example: /seo "digital marketing"

6. /idea
   Suggests random content ideas.

⚙️ Style Parameters (for /script and /shorts):
   • cinematic - Dramatic, visual storytelling
   • mystery - Suspenseful, intriguing
   • philosophical - Deep, thoughtful analysis

📊 Rate Limit: ${config.maxRequestsPerMinute} requests per minute`;
      
      ctx.reply(helpMessage);
    });

    // Command handlers
    this.bot.command('script', (ctx) => this.commandHandler.handleScript(ctx));
    this.bot.command('shorts', (ctx) => this.commandHandler.handleShorts(ctx));
    this.bot.command('title', (ctx) => this.commandHandler.handleTitle(ctx));
    this.bot.command('thumbnail', (ctx) => this.commandHandler.handleThumbnail(ctx));
    this.bot.command('seo', (ctx) => this.commandHandler.handleSeo(ctx));
    this.bot.command('idea', (ctx) => this.commandHandler.handleIdea(ctx));

    // Handle any other text
    this.bot.on('text', (ctx) => {
      ctx.reply("I only understand specific commands. Use /help to see available commands.");
    });
  }

  setupErrorHandling() {
    this.bot.catch((err, ctx) => {
      console.error(`[ERROR] ${err.message}`, err);
      ctx.reply('❌ An error occurred. Please try again later.');
    });
  }

  async start() {
    // Check if bot is initialized
    if (!this.bot || !this.isInitialized) {
      console.error('❌ Bot cannot start: BOT_TOKEN is not configured.');
      console.error('   Please set BOT_TOKEN environment variable in Railway.');
      console.error('   Go to Railway Dashboard → Your Project → Variables');
      console.error('   Add BOT_TOKEN with your Telegram bot token.');
      
      // Keep the health server running for configuration
      console.log('🩺 Health server is running for configuration checks.');
      return;
    }
    
    try {
      console.log('🤖 Starting Telegram Bot...');
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Rate Limit: ${config.maxRequestsPerMinute} requests/min`);
      console.log(`   API Mode: ${config.longchatApiKey ? 'Live' : 'Mock'}`);
      
      await this.bot.launch();
      console.log('✅ Bot is running!');
      console.log('📱 Connect with your Telegram client and send /start');
      
      // Enable graceful stop
      process.once('SIGINT', () => this.bot.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    } catch (error) {
      console.error('❌ Failed to start bot:', error.message);
      console.error('   Check your BOT_TOKEN and internet connection.');
      
      // Don't exit in production - keep container running for debugging
      if (!config.isProduction) {
        process.exit(1);
      }
    }
  }
}

// Start the bot
const bot = new TelegramBot();
bot.start();