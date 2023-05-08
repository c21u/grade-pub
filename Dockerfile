FROM node:lts-alpine as builder

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --non-interactive --no-progress --no-cache

COPY .eslintrc.js .
COPY webpack.common.js .
COPY webpack.prod.js .
COPY client client

# Needed until webpack >= 5.61.0
ENV NODE_OPTIONS --openssl-legacy-provider

RUN yarn build

FROM node:lts-alpine

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --production --no-progress --non-interactive --no-cache

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
ENV NODE_ENV production

ENTRYPOINT [ "node", "--max_old_space_size=400" ]
CMD [ "bin/www" ]
