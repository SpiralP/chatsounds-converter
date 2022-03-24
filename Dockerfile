FROM node:lts-alpine AS builder

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node client/package.json client/package.json
COPY --chown=node:node server/package.json server/package.json
RUN yarn install

COPY --chown=node:node . .
RUN yarn --production=true run build


FROM node:lts-alpine

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node client/package.json client/package.json
COPY --chown=node:node server/package.json server/package.json
RUN yarn --production=true install \
    && yarn cache clean

COPY --from=builder /home/node/app/client/dist ./client/dist
COPY --from=builder /home/node/app/server/dist ./server/dist


EXPOSE 8080
ENV PORT=8080
CMD [ "yarn", "--production=true", "start" ]
