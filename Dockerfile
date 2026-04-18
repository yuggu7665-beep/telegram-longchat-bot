# Use Node.js LTS version
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Create outputs directory
RUN mkdir -p outputs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port (if needed for health checks)
EXPOSE 3000

# Run the bot
CMD [ "npm", "start" ]