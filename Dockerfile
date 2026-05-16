# Build React application
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Install serve to host the build
RUN npm install -g serve

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Railway provides PORT environment variable
ENV PORT=3000

# Expose the port
EXPOSE ${PORT}

# Serve the build folder using serve with Railway's PORT
CMD ["sh", "-c", "serve -s build -l $PORT"]
