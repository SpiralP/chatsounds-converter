FROM node:lts-alpine@sha256:edaff7359149b451922a1ec148ceeba6cc8ba20411235f782f16329f41fe37e6 AS builder

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node client/package.json client/package.json
COPY --chown=node:node server/package.json server/package.json
RUN npm install

COPY --chown=node:node . .
RUN npm run build


FROM node:lts-alpine@sha256:edaff7359149b451922a1ec148ceeba6cc8ba20411235f782f16329f41fe37e6

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node client/package.json client/package.json
COPY --chown=node:node server/package.json server/package.json
RUN set -ex \
    && npm install --omit dev \
    && npm cache clean --force

COPY --from=builder /home/node/app/client/dist ./client/dist
COPY --from=builder /home/node/app/server/dist ./server/dist


EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production
CMD [ "npm", "start" ]
