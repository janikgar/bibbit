FROM node:14.19.1-bullseye as builder

RUN mkdir -p /app
WORKDIR /app
ADD package-lock.json package.json tsconfig.json webpack.config.js /app/
COPY dist /app/dist
COPY src /app/src

RUN npm install --save-dev && \
    npm run build

FROM nginx:1.21.6-alpine
COPY --from=builder /app/dist /usr/share/nginx/html