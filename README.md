# Telegram LongChat Bot 🤖

A modular Telegram bot for content generation using LongChat API. Generate scripts, shorts, titles, thumbnails, SEO content, and ideas with AI-powered creativity.

## Features

- **Multiple Content Modes**: Script, Shorts, Title, Thumbnail, SEO, and Idea generation
- **Style Parameters**: Cinematic, mystery, philosophical styles for scripts/shorts
- **Anti-Repetition Logic**: Intelligent variation to prevent duplicate outputs
- **Rate Limiting**: Configurable request limits per user
- **File Generation**: Downloadable .txt files for scripts and shorts
- **UTF-8 Support**: Full Unicode support for Hindi and other languages
- **Modular Architecture**: Easy to extend and customize

## Command System

| Command                   | Description                      | Example                        |
| ------------------------- | -------------------------------- | ------------------------------ |
| `/start`                  | Welcome message and command list | `/start`                       |
| `/help`                   | Detailed command reference       | `/help`                        |
| `/script <topic> [style]` | Generate full video script       | `/script AI cinematic`         |
| `/shorts <topic> [style]` | Generate shorts/reels script     | `/shorts climate change`       |
| `/title <topic>`          | Generate engaging titles         | `/title future of education`   |
| `/thumbnail <topic>`      | Generate thumbnail ideas         | `/thumbnail space exploration` |
| `/seo <topic>`            | Generate SEO optimization tips   | `/seo digital marketing`       |
| `/idea`                   | Get random content ideas         | `/idea`                        |

## Style Parameters

For `/script` and `/shorts` commands, you can add style parameters:

- `cinematic` - Dramatic, visual storytelling
- `mystery` - Suspenseful, intriguing
- `philosophical` - Deep, thoughtful analysis

Example: `/script artificial intelligence philosophical`

## Quick Start

### 1. Prerequisites

- Node.js 18 or higher
- Telegram Bot Token from [@BotFather](https://t.me/botfather)
- LongChat API Key from [LongCat API Platform](https://platform.longcat.chat)

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd telegram-longchat-bot

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

### 3. Configuration

Edit `.env` file:

```env
BOT_TOKEN=your_telegram_bot_token_here
LONGCHAT_API_KEY=your_longchat_api_key_here
MAX_REQUESTS_PER_MINUTE=5
OUTPUT_DIR=./outputs
```

### 4. Running the Bot

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## Deployment

### Railway (Recommended)

1. Push to GitHub
2. Create new project on Railway
3. Add environment variables
4. Deploy automatically

### Docker

```bash
# Build image
docker build -t telegram-longchat-bot .

# Run container
docker run -d \
  --name telegram-bot \
  -e BOT_TOKEN=your_token \
  -e LONGCHAT_API_KEY=your_key \
  -v ./outputs:/usr/src/app/outputs \
  telegram-longchat-bot
```

### Manual Deployment (VPS/AWS)

```bash
# Install dependencies
npm ci --production

# Set up PM2 for process management
npm install -g pm2
pm2 start src/index.js --name telegram-bot
pm2 save
pm2 startup
```

## API Integration

The bot uses LongChat API with the following structure:

### System Prompt

```
You are a professional content creator and scriptwriter specializing in engaging, viral content.
Your task is to generate high-quality content based on the given MODE and TOPIC.
```

### User Prompt Format

```
MODE: <mode>
TOPIC: <user topic>
STYLE: <optional style>
STYLE INSTRUCTIONS: <style-specific guidance>
ADDITIONAL INSTRUCTION: <anti-repetition variation>
```

## Project Structure

```
telegram-longchat-bot/
├── src/
│   ├── index.js              # Main bot entry point
│   ├── config.js             # Configuration management
│   ├── health.js             # Health check server
│   ├── services/
│   │   ├── botService.js     # Core business logic
│   │   ├── longchatAPI.js    # API integration
│   │   └── fileGenerator.js  # File generation
│   ├── handlers/
│   │   └── commandHandler.js # Command processing
│   └── utils/
│       ├── antiRepetition.js # Anti-repetition logic
│       └── rateLimiter.js    # Rate limiting
├── outputs/                  # Generated files
├── .env.example             # Environment template
├── package.json             # Dependencies
├── Dockerfile              # Container configuration
├── railway.json           # Railway deployment
└── README.md              # This file
```

## Configuration Options

| Environment Variable      | Default                                       | Description                           |
| ------------------------- | --------------------------------------------- | ------------------------------------- |
| `BOT_TOKEN`               | Required                                      | Telegram Bot Token                    |
| `LONGCHAT_API_KEY`        | Required                                      | LongChat API Key                      |
| `LONGCHAT_API_URL`        | `https://api.longchat.ai/v1/chat/completions` | API endpoint                          |
| `MAX_REQUESTS_PER_MINUTE` | `5`                                           | Rate limit per user                   |
| `MAX_HISTORY_STORAGE`     | `10`                                          | User history size for anti-repetition |
| `OUTPUT_DIR`              | `./outputs`                                   | Directory for generated files         |
| `PORT`                    | `3000`                                        | Health check server port              |

## Rate Limiting

- Default: 5 requests per minute per user
- Configurable via `MAX_REQUESTS_PER_MINUTE`
- Automatic blocking after limit exceeded
- Whitelist capability for admin users

## Anti-Repetition System

The bot includes intelligent anti-repetition logic:

- Tracks user request history
- Provides variation instructions to API
- Prevents duplicate content structure
- Style-specific variations for cinematic/mystery/philosophical modes

## File Generation

- Scripts and shorts are saved as `.txt` files
- UTF-8 encoding for multilingual support
- Automatic cleanup of old files
- Downloadable via Telegram document sharing

## Error Handling

- Automatic API retry on failure
- Graceful fallback to mock responses (development)
- Comprehensive error logging
- User-friendly error messages

## Monitoring & Health Checks

The bot includes a health check server:

- `GET /health` - Service health status
- `GET /status` - System metrics and bot status
- Automatic monitoring for deployment platforms

## Future Extensions

Planned features:

- [ ] Auto voice generation
- [ ] Auto video generation
- [ ] Content calendar system
- [ ] Database integration (PostgreSQL/Redis)
- [ ] Admin dashboard
- [ ] Multi-language support
- [ ] Scheduled content generation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests:

1. Check the [Issues](https://github.com/yourusername/telegram-longchat-bot/issues) page
2. Create a new issue with detailed description
3. Include relevant logs and configuration

## Acknowledgments

- [Telegraf](https://github.com/telegraf/telegraf) - Telegram Bot Framework
- [LongChat API](https://platform.longcat.chat) - AI Content Generation
- [Rate Limiter Flexible](https://github.com/animir/node-rate-limiter-flexible) - Rate limiting

---

**Note**: This bot requires valid API keys for Telegram and LongChat. The free tier of LongChat API provides 500,000 tokens daily.
