FROM node:alpine

RUN apk update && apk add jq
WORKDIR /usr/local/src

COPY package* /usr/local/src/
RUN npm i

# patch to make node-jq works on alpine
RUN mkdir /usr/local/src/node_modules/node-jq/bin
RUN cp /usr/bin/jq /usr/local/src/node_modules/node-jq/bin/jq

COPY . /usr/local/src
