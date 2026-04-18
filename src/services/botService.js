const LongChatAPI = require('./longchatAPI');
const FileGenerator = require('./fileGenerator');
const AntiRepetition = require('../utils/antiRepetition');
const config = require('../config');

class BotService {
  constructor() {
    this.longchatAPI = new LongChatAPI();
    this.fileGenerator = new FileGenerator();
    this.antiRepetition = new AntiRepetition();
  }

  /**
   * Parse command and extract mode, topic, and style
   */
  parseCommand(text, command) {
    // Remove the command from the text
    const args = text.replace(`/${command}`, '').trim();
    
    if (!args) {
      return { topic: null, style: null };
    }

    // Check for style parameters
    const styleKeywords = Object.keys(config.styles);
    let style = null;
    let topic = args;

    // Find style at the end of the message
    for (const styleKey of styleKeywords) {
      if (args.toLowerCase().endsWith(styleKey.toLowerCase())) {
        style = styleKey;
        topic = args.substring(0, args.length - styleKey.length).trim();
        break;
      }
    }

    // If no topic after removing style, generate one
    if (!topic) {
      topic = this.generateRandomTopic();
    }

    return { topic, style };
  }

  /**
   * Generate a random topic when none is provided
   */
  generateRandomTopic() {
    const topics = [
      'Artificial Intelligence',
      'Climate Change',
      'Space Exploration',
      'Future of Education',
      'Digital Transformation',
      'Mental Health Awareness',
      'Sustainable Energy',
      'Blockchain Technology',
      'Virtual Reality',
      'Quantum Computing',
      'Renewable Energy',
      'Cybersecurity',
      'Remote Work',
      'E-commerce Trends',
      'Health Tech Innovations'
    ];
    
    return topics[Math.floor(Math.random() * topics.length)];
  }

  /**
   * Generate content based on mode and topic
   */
  async generateContent(mode, topic, style = null, userId = null) {
    try {
      // Get mode configuration
      const modeConfig = config.modes[mode.toLowerCase()];
      if (!modeConfig) {
        throw new Error(`Invalid mode: ${mode}`);
      }

      // Apply anti-repetition variation
      const variationInstruction = this.antiRepetition.getVariationInstruction(userId);

      // Prepare user prompt
      const userPrompt = this.buildUserPrompt(modeConfig.name, topic, style, variationInstruction);

      // Call LongChat API
      const response = await this.longchatAPI.generate({
        systemPrompt: config.systemPrompt,
        userPrompt,
        mode: modeConfig.name
      });

      // Store in history for anti-repetition
      if (userId) {
        this.antiRepetition.addToHistory(userId, {
          mode,
          topic,
          response: response.substring(0, 100) // Store first 100 chars for comparison
        });
      }

      // Generate file if needed
      let filePath = null;
      if (modeConfig.fileOutput) {
        filePath = await this.fileGenerator.generateFile(
          mode,
          topic,
          response,
          style
        );
      }

      return {
        success: true,
        content: response,
        filePath,
        mode: modeConfig.name,
        topic,
        style
      };
    } catch (error) {
      console.error(`Error generating content: ${error.message}`);
      
      // Retry once
      try {
        console.log('Retrying API call...');
        const response = await this.longchatAPI.generate({
          systemPrompt: config.systemPrompt,
          userPrompt: this.buildUserPrompt(config.modes[mode.toLowerCase()].name, topic, style, ''),
          mode: config.modes[mode.toLowerCase()].name
        });

        return {
          success: true,
          content: response,
          filePath: null,
          mode: config.modes[mode.toLowerCase()].name,
          topic,
          style
        };
      } catch (retryError) {
        return {
          success: false,
          error: `Failed after retry: ${retryError.message}`,
          mode: config.modes[mode.toLowerCase()].name,
          topic
        };
      }
    }
  }

  /**
   * Build user prompt according to API structure
   */
  buildUserPrompt(mode, topic, style, variationInstruction) {
    let prompt = `MODE: ${mode}\n`;
    prompt += `TOPIC: ${topic}\n`;
    
    if (style && config.styles[style]) {
      prompt += `STYLE: ${style}\n`;
      prompt += `STYLE INSTRUCTIONS: ${config.styles[style]}\n`;
    }
    
    if (variationInstruction) {
      prompt += `ADDITIONAL INSTRUCTION: ${variationInstruction}\n`;
    }
    
    prompt += `\nPlease generate appropriate content for the above MODE and TOPIC.`;
    
    return prompt;
  }

  /**
   * Get random content idea
   */
  async getContentIdea() {
    const ideas = [
      "The impact of AI on creative industries",
      "How blockchain is revolutionizing supply chains",
      "The future of remote work in a post-pandemic world",
      "Sustainable fashion: Trends and innovations",
      "Mental health in the digital age",
      "The rise of electric vehicles and infrastructure challenges",
      "How social media algorithms shape public opinion",
      "The ethics of genetic engineering",
      "Space tourism: Opportunities and risks",
      "The future of food: Lab-grown meat and vertical farming",
      "Cybersecurity threats in the IoT era",
      "The role of AR/VR in education",
      "Climate change adaptation strategies for cities",
      "The gig economy and worker rights",
      "Quantum computing's potential impact on cryptography"
    ];

    const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
    
    // Generate a brief elaboration using the API
    try {
      const response = await this.longchatAPI.generate({
        systemPrompt: "You are a content strategist. Provide a brief, engaging elaboration on content ideas.",
        userPrompt: `IDEA: ${randomIdea}\n\nProvide a 2-3 sentence elaboration on why this would make engaging content.`,
        mode: 'IDEA'
      });

      return {
        idea: randomIdea,
        elaboration: response
      };
    } catch (error) {
      return {
        idea: randomIdea,
        elaboration: "This topic offers rich opportunities for exploration and discussion in various content formats."
      };
    }
  }
}

module.exports = BotService;