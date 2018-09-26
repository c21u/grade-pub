FROM node:8-alpine

COPY . /app
WORKDIR /app

RUN yarn install --production --no-progress
RUN yarn build

EXPOSE 3000
USER node
ENV NODE_ENV production

ENTRYPOINT [ "node" ]
CMD [ "bin/www" ]