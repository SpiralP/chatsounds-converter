# docker build -t spiralp/chatsounds-converter . && docker push spiralp/chatsounds-converter

# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
FROM node:12-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package.json yarn.lock ./

# Install production dependencies.
# If you add a package-lock.json, speed your build by switching to 'npm ci'.
# RUN npm ci --only=production
RUN yarn install

# Copy local code to the container image.
COPY . ./

RUN yarn build

# Run the web service on container startup.
CMD [ "yarn", "start" ]
