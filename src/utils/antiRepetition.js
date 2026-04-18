const config = require('../config');

class AntiRepetition {
  constructor() {
    // In-memory storage for user history
    // In production, this should be replaced with a database (Redis, MongoDB, etc.)
    this.userHistory = new Map();
    this.maxHistory = config.maxHistoryStorage || 10;
    
    // Variation instructions pool
    this.variationInstructions = [
      "Use a different narrative style than previous output",
      "Approach this topic from a fresh perspective",
      "Incorporate a unique storytelling angle",
      "Vary the sentence structure and paragraph length",
      "Use different examples and analogies than before",
      "Employ contrasting rhetorical devices",
      "Shift the tone slightly while maintaining professionalism",
      "Introduce the topic with an unexpected hook",
      "Structure the content in a novel organizational pattern",
      "Balance factual information with creative expression differently",
      "Vary the pacing between detailed explanations and concise summaries",
      "Use different transitional phrases and connectors",
      "Employ varied vocabulary while maintaining clarity",
      "Approach the conclusion from a different emotional angle",
      "Mix different types of evidence and supporting details"
    ];
    
    // Style-specific variations
    this.styleVariations = {
      cinematic: [
        "Use different camera angle descriptions",
        "Vary the pacing between slow-motion and fast-cut sequences",
        "Employ contrasting visual metaphors",
        "Shift between different lighting scenarios",
        "Use varied sound design elements in descriptions"
      ],
      mystery: [
        "Build suspense through different narrative techniques",
        "Vary the timing of reveals and cliffhangers",
        "Use different types of foreshadowing",
        "Employ contrasting red herrings",
        "Shift between different points of view"
      ],
      philosophical: [
        "Approach the topic from different philosophical schools",
        "Vary the balance between abstract and concrete reasoning",
        "Use different thought experiments",
        "Employ contrasting rhetorical questions",
        "Shift between different historical perspectives"
      ]
    };
  }

  /**
   * Add user request to history
   */
  addToHistory(userId, requestData) {
    if (!this.userHistory.has(userId)) {
      this.userHistory.set(userId, []);
    }
    
    const history = this.userHistory.get(userId);
    history.unshift(requestData); // Add to beginning
    
    // Trim history to max size
    if (history.length > this.maxHistory) {
      history.pop();
    }
    
    this.userHistory.set(userId, history);
  }

  /**
   * Get user history
   */
  getHistory(userId) {
    return this.userHistory.get(userId) || [];
  }

  /**
   * Get variation instruction based on user history
   */
  getVariationInstruction(userId) {
    const history = this.getHistory(userId);
    
    if (history.length === 0) {
      // No history, return a random variation
      return this.getRandomVariation();
    }
    
    // Analyze recent requests for patterns
    const recentModes = history.slice(0, 3).map(item => item.mode);
    const recentTopics = history.slice(0, 3).map(item => item.topic);
    
    // Check if user is requesting similar content repeatedly
    const hasSimilarRecentRequests = this.hasSimilarRequests(history);
    
    if (hasSimilarRecentRequests) {
      // User is making similar requests, provide stronger variation
      return this.getStrongVariation(history);
    }
    
    // Return a random variation with slight preference for unused ones
    return this.getWeightedVariation(history);
  }

  /**
   * Check if user has similar recent requests
   */
  hasSimilarRequests(history) {
    if (history.length < 2) return false;
    
    const recent = history.slice(0, 2);
    
    // Check for same mode
    if (recent[0].mode === recent[1].mode) {
      // Check for similar topics (simple string similarity)
      const topic1 = recent[0].topic.toLowerCase();
      const topic2 = recent[1].topic.toLowerCase();
      
      // Simple similarity check (could be enhanced with NLP)
      if (topic1 === topic2 || 
          topic1.includes(topic2) || 
          topic2.includes(topic1) ||
          this.calculateSimilarity(topic1, topic2) > 0.7) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Calculate simple string similarity (Jaccard index of words)
   */
  calculateSimilarity(str1, str2) {
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Get random variation instruction
   */
  getRandomVariation() {
    const randomIndex = Math.floor(Math.random() * this.variationInstructions.length);
    return this.variationInstructions[randomIndex];
  }

  /**
   * Get strong variation for repetitive requests
   */
  getStrongVariation(history) {
    const strongVariations = [
      "Drastically change the narrative approach and structure",
      "Use completely different examples and case studies",
      "Shift to a contrasting tone and perspective",
      "Employ opposite rhetorical strategies",
      "Structure the content in a fundamentally different way",
      "Approach the topic from the opposite angle",
      "Use counter-intuitive examples and explanations",
      "Challenge conventional assumptions about this topic"
    ];
    
    // Combine with style-specific variations if applicable
    const lastRequest = history[0];
    if (lastRequest.style && this.styleVariations[lastRequest.style]) {
      const styleVars = this.styleVariations[lastRequest.style];
      strongVariations.push(...styleVars);
    }
    
    const randomIndex = Math.floor(Math.random() * strongVariations.length);
    return strongVariations[randomIndex];
  }

  /**
   * Get weighted variation (prefer unused instructions)
   */
  getWeightedVariation(history) {
    // Extract previously used variations from response snippets
    const usedVariations = this.extractUsedVariations(history);
    
    // Filter out recently used variations
    const availableVariations = this.variationInstructions.filter(
      variation => !usedVariations.some(used => 
        this.calculateSimilarity(variation, used) > 0.5
      )
    );
    
    // If all variations have been used, return a random one
    if (availableVariations.length === 0) {
      return this.getRandomVariation();
    }
    
    // Return a random available variation
    const randomIndex = Math.floor(Math.random() * availableVariations.length);
    return availableVariations[randomIndex];
  }

  /**
   * Extract used variations from history (simplified)
   */
  extractUsedVariations(history) {
    // In a real implementation, you would parse the actual responses
    // For now, we'll return a simplified version
    const used = [];
    
    // Check if responses contain variation patterns
    history.forEach(item => {
      if (item.response) {
        // Simple pattern matching (could be enhanced)
        if (item.response.includes("different") || item.response.includes("unique")) {
          used.push("Use a different narrative style");
        }
        if (item.response.includes("perspective") || item.response.includes("angle")) {
          used.push("Approach this topic from a fresh perspective");
        }
      }
    });
    
    return used;
  }

  /**
   * Get style-specific variation
   */
  getStyleVariation(style) {
    if (style && this.styleVariations[style]) {
      const variations = this.styleVariations[style];
      const randomIndex = Math.floor(Math.random() * variations.length);
      return variations[randomIndex];
    }
    
    return this.getRandomVariation();
  }

  /**
   * Clear user history
   */
  clearHistory(userId) {
    this.userHistory.delete(userId);
  }

  /**
   * Get statistics about user history
   */
  getStatistics() {
    const stats = {
      totalUsers: this.userHistory.size,
      totalRequests: 0,
      averageRequestsPerUser: 0
    };
    
    let totalRequests = 0;
    this.userHistory.forEach(history => {
      totalRequests += history.length;
    });
    
    stats.totalRequests = totalRequests;
    stats.averageRequestsPerUser = stats.totalUsers > 0 ? 
      (totalRequests / stats.totalUsers).toFixed(2) : 0;
    
    return stats;
  }
}

module.exports = AntiRepetition;