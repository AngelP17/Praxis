FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm@10.29.3

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/ apps/web/
COPY packages/eslint-plugin-gpt-taste/ packages/eslint-plugin-gpt-taste/

ENV CI=true

RUN pnpm install --filter praxis-web...
RUN cd apps/web && pnpm build

EXPOSE 3000

WORKDIR /app/apps/web
CMD ["pnpm", "start"]
