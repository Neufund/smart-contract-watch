FROM node:7-alpine
RUN apt-get update
RUN curl -o- -L https://yarnpkg.com/install.sh | bash
WORKDIR /app
COPY package.json /app
RUN yarn
COPY . /app
