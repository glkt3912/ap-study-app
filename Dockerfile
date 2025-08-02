FROM node:22-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Development mode - no build needed

EXPOSE 3000

CMD ["npm", "run", "dev"]