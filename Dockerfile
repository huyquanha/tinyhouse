FROM node:15.13.0 as base

WORKDIR /app

COPY **/package.json **/package-lock.json ./

FROM base as lint
RUN npm ci
COPY . .
RUN npm run ci-lint

FROM lint as build
RUN npm run build

FROM build as prod
RUN npm prune --production
CMD ["npm", "start"]