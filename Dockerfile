FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bun run test
RUN bun run build

FROM dhi.io/nginx:1.31@sha256:2f1052f34665960b0ccc99b6a88f374f0b690e058ef104f827468dcadbe442ac
COPY --from=prerelease /usr/src/app/dist /usr/share/nginx/html
