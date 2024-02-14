FROM node:lts-alpine AS base
ENV NODE_ENV=production YARN_VERSION=4.0.1

RUN apk update && apk upgrade && apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

FROM base AS builder

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn install --immutable

COPY .eslintrc.cjs .
COPY webpack.common.js .
COPY webpack.prod.js .
COPY client client

RUN yarn build

FROM base AS runner

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn workspaces focus --all --production

COPY --from=builder /app/dist dist

COPY server.js .
COPY config.js .

COPY bin/ ./bin
COPY lib ./lib
COPY public ./public
COPY routes ./routes
COPY views ./views

EXPOSE 3000
USER node

ENTRYPOINT [ "node", "--max_old_space_size=400" ]
CMD [ "bin/www" ]
