# Build React application
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Install serve to host the build
RUN npm install -g serve

# Build arguments for environment variables
ARG REACT_APP_BASE_URL
ARG REACT_APP_WS_URL

# Copy source code
COPY . .

# Set environment variables for build and log them for debugging
ENV REACT_APP_BASE_URL=${REACT_APP_BASE_URL}
ENV REACT_APP_WS_URL=${REACT_APP_WS_URL}

# Debug: Print environment variables
RUN echo "Building with:" && \
    echo "REACT_APP_BASE_URL=${REACT_APP_BASE_URL}" && \
    echo "REACT_APP_WS_URL=${REACT_APP_WS_URL}"

# Build the application with environment variables
RUN npm run build

# Railway provides PORT environment variable
ENV PORT=3000

# Expose the port
EXPOSE ${PORT}

# Serve the build folder using serve with Railway's PORT
CMD ["sh", "-c", "serve -s build -l $PORT"]
