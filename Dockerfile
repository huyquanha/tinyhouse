FROM node:14.16.0 as base

WORKDIR /app

COPY package*.json ./
COPY ./server/package*.json ./server/
COPY ./client/package*.json ./client/

FROM base as lint
RUN npm set unsafe-perm true
RUN npm ci
COPY . .
RUN npm run ci-lint

FROM lint as build
RUN npm run build

FROM build as prod
RUN npm prune --production
CMD ["npm", "start"]