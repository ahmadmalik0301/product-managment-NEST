FROM node:20-alpine

WORKDIR /usr/src/app


RUN apk add --no-cache postgresql-client
# Copy package files first (better build cache)
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy the rest of the source
COPY . .

# Build the NestJS app
RUN npm run build

EXPOSE 3000

# Default command (will be overridden by docker-compose "command")
CMD ["npm", "run", "start:prod"]
