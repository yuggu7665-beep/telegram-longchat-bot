const { RateLimiterMemory } = require('rate-limiter-flexible');
const config = require('../config');

class RateLimiter {
  constructor(requestsPerMinute = 5) {
    // Create rate limiter with configurable limits
    this.requestsPerMinute = requestsPerMinute;
    
    this.rateLimiter = new RateLimiterMemory({
      points: requestsPerMinute, // Number of points
      duration: 60, // Per 60 seconds
      blockDuration: 60 * 5, // Block for 5 minutes if exceeded
    });
    
    // Store user request timestamps for analytics
    this.userRequests = new Map();
    
    // Whitelist for admin users (optional)
    this.whitelist = new Set();
  }

  /**
   * Consume a point for a user
   */
  async consume(userId) {
    try {
      // Check if user is whitelisted
      if (this.whitelist.has(userId)) {
        return { allowed: true, remaining: Infinity };
      }

      await this.rateLimiter.consume(userId);
      
      // Track request for analytics
      this.trackRequest(userId);
      
      return { allowed: true, remaining: await this.getRemainingPoints(userId) };
    } catch (error) {
      if (error.msBeforeNext) {
        const seconds = Math.ceil(error.msBeforeNext / 1000);
        return { 
          allowed: false, 
          remaining: 0,
          retryAfter: seconds,
          message: `Rate limit exceeded. Please wait ${seconds} seconds.`
        };
      }
      throw error;
    }
  }

  /**
   * Get remaining points for a user
   */
  async getRemainingPoints(userId) {
    try {
      const res = await this.rateLimiter.get(userId);
      return res ? res.remainingPoints : this.requestsPerMinute;
    } catch (error) {
      return this.requestsPerMinute;
    }
  }

  /**
   * Track user request for analytics
   */
  trackRequest(userId) {
    const now = Date.now();
    
    if (!this.userRequests.has(userId)) {
      this.userRequests.set(userId, []);
    }
    
    const requests = this.userRequests.get(userId);
    requests.push(now);
    
    // Keep only last hour of requests for memory management
    const oneHourAgo = now - (60 * 60 * 1000);
    const filtered = requests.filter(timestamp => timestamp > oneHourAgo);
    this.userRequests.set(userId, filtered);
  }

  /**
   * Get user request statistics
   */
  getUserStats(userId) {
    const now = Date.now();
    const requests = this.userRequests.get(userId) || [];
    
    // Filter by time windows
    const lastMinute = requests.filter(t => t > now - 60000).length;
    const last5Minutes = requests.filter(t => t > now - 300000).length;
    const lastHour = requests.filter(t => t > now - 3600000).length;
    const lastDay = requests.filter(t => t > now - 86400000).length;
    
    return {
      userId,
      totalRequests: requests.length,
      lastMinute,
      last5Minutes,
      lastHour,
      lastDay,
      limitPerMinute: this.requestsPerMinute
    };
  }

  /**
   * Get all users statistics (for admin/monitoring)
   */
  getAllStats() {
    const stats = {
      totalUsers: this.userRequests.size,
      totalRequests: 0,
      activeUsersLastHour: 0,
      usersNearLimit: 0
    };
    
    const oneHourAgo = Date.now() - 3600000;
    
    this.userRequests.forEach((requests, userId) => {
      stats.totalRequests += requests.length;
      
      // Check if user was active in last hour
      if (requests.some(timestamp => timestamp > oneHourAgo)) {
        stats.activeUsersLastHour++;
      }
      
      // Check if user is near rate limit
      const lastMinuteRequests = requests.filter(t => t > Date.now() - 60000).length;
      if (lastMinuteRequests >= this.requestsPerMinute * 0.8) {
        stats.usersNearLimit++;
      }
    });
    
    return stats;
  }

  /**
   * Reset rate limit for a user
   */
  async resetUser(userId) {
    try {
      await this.rateLimiter.delete(userId);
      this.userRequests.delete(userId);
      return true;
    } catch (error) {
      console.error(`Error resetting user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Add user to whitelist
   */
  addToWhitelist(userId) {
    this.whitelist.add(userId);
    return true;
  }

  /**
   * Remove user from whitelist
   */
  removeFromWhitelist(userId) {
    return this.whitelist.delete(userId);
  }

  /**
   * Check if user is whitelisted
   */
  isWhitelisted(userId) {
    return this.whitelist.has(userId);
  }

  /**
   * Get rate limit configuration
   */
  getConfig() {
    return {
      requestsPerMinute: this.requestsPerMinute,
      whitelistedUsers: Array.from(this.whitelist),
      totalTrackedUsers: this.userRequests.size
    };
  }

  /**
   * Clean up old request data (memory management)
   */
  cleanupOldData(maxAgeHours = 24) {
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    
    this.userRequests.forEach((requests, userId) => {
      const filtered = requests.filter(timestamp => now - timestamp < maxAge);
      if (filtered.length === 0) {
        this.userRequests.delete(userId);
      } else {
        this.userRequests.set(userId, filtered);
      }
    });
    
    return this.userRequests.size;
  }
}

module.exports = RateLimiter;