FROM node:8.7.0-alpine
RUN apk update && apk upgrade && \
    apk add --no-cache git
WORKDIR /app
COPY package.json /app
RUN yarn
COPY . /app
