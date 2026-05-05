FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.29.3

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY . .

# Install dependencies and build
RUN pnpm install --frozen-lockfile
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
