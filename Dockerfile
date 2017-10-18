FROM node:7
RUN apt-get update
RUN apt-get install -y vim 

RUN curl -o- -L https://yarnpkg.com/install.sh | bash

WORKDIR /app
COPY package.json /app
RUN yarn
COPY . /app
