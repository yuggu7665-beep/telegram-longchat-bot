const axios = require('axios');
const config = require('../config');

class LongChatAPI {
  constructor() {
    this.apiKey = config.longchatApiKey;
    this.apiUrl = config.longchatApiUrl;
    
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });
  }

  /**
   * Generate content using LongChat API
   */
  async generate({ systemPrompt, userPrompt, mode, temperature = 0.7, maxTokens = 2000 }) {
    try {
      console.log(`Calling LongChat API for mode: ${mode}`);
      
      // Adjust parameters based on mode
      const adjustedParams = this.adjustParametersForMode(mode, maxTokens);
      
      const requestBody = {
        model: 'LongCat-Flash-Chat', // Using the recommended model
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: adjustedParams.temperature,
        max_tokens: adjustedParams.maxTokens,
        stream: false
      };

      const response = await this.client.post('', requestBody);
      
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const content = response.data.choices[0].message.content;
        console.log(`API call successful. Response length: ${content.length} characters`);
        return content;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('LongChat API Error:', error.response?.data || error.message);
      
      // Provide fallback content if API fails
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a minute.');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your configuration.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to API server. Please check your network.');
      } else {
        // Fallback to mock response for development
        if (!this.apiKey || this.apiKey === 'your_longchat_api_key_here') {
          console.log('Using mock response (no API key configured)');
          return this.getMockResponse(mode, userPrompt);
        }
        throw new Error(`API request failed: ${error.message}`);
      }
    }
  }

  /**
   * Adjust parameters based on content mode
   */
  adjustParametersForMode(mode, defaultMaxTokens) {
    const params = {
      temperature: 0.7,
      maxTokens: defaultMaxTokens
    };

    switch (mode.toUpperCase()) {
      case 'SCRIPT':
        params.temperature = 0.8; // More creative for scripts
        params.maxTokens = 3000; // Longer scripts
        break;
      case 'SHORTS':
        params.temperature = 0.9; // Very creative for shorts
        params.maxTokens = 1500; // Shorter content
        break;
      case 'TITLE':
        params.temperature = 0.9; // Creative for titles
        params.maxTokens = 500;
        break;
      case 'THUMBNAIL':
        params.temperature = 0.8;
        params.maxTokens = 800;
        break;
      case 'SEO':
        params.temperature = 0.6; // More factual for SEO
        params.maxTokens = 1000;
        break;
      case 'IDEA':
        params.temperature = 0.9;
        params.maxTokens = 800;
        break;
      default:
        params.temperature = 0.7;
        params.maxTokens = 2000;
    }

    return params;
  }

  /**
   * Mock response for development (when no API key is configured)
   */
  getMockResponse(mode, userPrompt) {
    const modeUpper = mode.toUpperCase();
    const timestamp = new Date().toISOString();
    
    const mockResponses = {
      'SCRIPT': `# Script: ${this.extractTopicFromPrompt(userPrompt)}

## Introduction
[Opening scene that grabs attention]

## Main Content
- Key point 1 with supporting details
- Key point 2 with examples
- Key point 3 with actionable insights

## Conclusion
[Memorable closing that reinforces main message]

## Technical Details
- Duration: 5-7 minutes
- Target audience: General viewers
- Style: Engaging and informative

Generated: ${timestamp}`,

      'SHORTS': `# Shorts Script: ${this.extractTopicFromPrompt(userPrompt)}

## Hook (0-3 seconds)
[Attention-grabbing opening]

## Content (4-45 seconds)
- Quick fact 1
- Visual suggestion
- Engaging question

## Call to Action (46-60 seconds)
[Encourage likes, shares, follows]

## Hashtags
#${this.extractTopicFromPrompt(userPrompt).replace(/\s+/g, '')} #ContentCreation #Shorts

Generated: ${timestamp}`,

      'TITLE': `## Title Options for: ${this.extractTopicFromPrompt(userPrompt)}

1. "The Future of ${this.extractTopicFromPrompt(userPrompt)}: What You Need to Know"
2. "5 Game-Changing Insights About ${this.extractTopicFromPrompt(userPrompt)}"
3. "How ${this.extractTopicFromPrompt(userPrompt)} Is Transforming Our World"
4. "The Untold Story of ${this.extractTopicFromPrompt(userPrompt)}"
5. "${this.extractTopicFromPrompt(userPrompt)}: A Complete Beginner's Guide"

Generated: ${timestamp}`,

      'THUMBNAIL': `## Thumbnail Ideas for: ${this.extractTopicFromPrompt(userPrompt)}

### Design 1: Bold Text
- Background: Gradient (blue to purple)
- Main text: "The TRUTH About ${this.extractTopicFromPrompt(userPrompt)}"
- Accent: Red arrow pointing to key element
- Face: Surprised expression (optional)

### Design 2: Minimalist
- Background: Clean white
- Icon: Relevant symbol (AI brain, globe, etc.)
- Text: "${this.extractTopicFromPrompt(userPrompt)} Explained"
- Color scheme: Professional blue

### Design 3: Action Shot
- Background: Dynamic scene related to topic
- Overlay: Semi-transparent dark layer
- Text in bright contrasting color
- Your face in corner with reaction

### Best Practices:
1. Use high contrast colors
2. Keep text large and readable
3. Include human element (face/emoji)
4. Create curiosity gap

Generated: ${timestamp}`,

      'SEO': `## SEO Optimization for: ${this.extractTopicFromPrompt(userPrompt)}

### Primary Keyword: "${this.extractTopicFromPrompt(userPrompt).toLowerCase()}"

### Secondary Keywords:
- "${this.extractTopicFromPrompt(userPrompt)} guide"
- "best ${this.extractTopicFromPrompt(userPrompt)} tips"
- "${this.extractTopicFromPrompt(userPrompt)} 2026"

### Meta Description:
Discover comprehensive insights about ${this.extractTopicFromPrompt(userPrompt)}. Learn key strategies, latest trends, and practical applications in this complete guide.

### Header Structure:
H1: Complete Guide to ${this.extractTopicFromPrompt(userPrompt)}
H2: What is ${this.extractTopicFromPrompt(userPrompt)}?
H2: Key Benefits and Applications
H2: Future Trends
H2: Getting Started

### Internal Linking:
- Link to related content on your site
- Use descriptive anchor text

### External Linking:
- Link to authoritative sources
- Cite recent studies/data

Generated: ${timestamp}`
    };

    return mockResponses[modeUpper] || `Content for ${mode}: ${this.extractTopicFromPrompt(userPrompt)}\n\nGenerated: ${timestamp}`;
  }

  /**
   * Extract topic from user prompt
   */
  extractTopicFromPrompt(userPrompt) {
    const topicMatch = userPrompt.match(/TOPIC:\s*(.+?)(\n|$)/i);
    return topicMatch ? topicMatch[1].trim() : 'Unknown Topic';
  }
}

module.exports = LongChatAPI;