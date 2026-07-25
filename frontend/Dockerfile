FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose port 5173 for Vite
EXPOSE 5173

# Start development server and listen on all interfaces
CMD ["npm", "run", "dev"]
