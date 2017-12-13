FROM node:9.2.1-alpine as builder
RUN apk update && apk upgrade && \
    apk add --no-cache git
WORKDIR /build
ADD ./package.json ./.babelrc ./
ADD ./src ./src
RUN yarn
RUN yarn build

FROM node:9.2.1-alpine
RUN apk update && apk upgrade && \
    apk add --no-cache git
WORKDIR /app
COPY --from=builder ./build/dist ./dist
COPY  ./.env ./.watch.yml ./package.json ./
RUN yarn --production
