FROM node:23

WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend files
COPY . .

# Expose port
EXPOSE 3000

# Start dev server
CMD ["sh", "-c", "npm run dev && npm run start"]
