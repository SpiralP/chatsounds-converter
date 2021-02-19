FROM node:alpine

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node ./client/package.json ./client/package.json
COPY --chown=node:node ./server/package.json ./server/package.json
RUN yarn install

COPY --chown=node:node . ./
RUN yarn build

EXPOSE 80
ENV PORT=80
CMD [ "yarn", "start" ]
