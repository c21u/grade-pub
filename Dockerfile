FROM node:10.13.0-alpine

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --non-interactive --no-progress --production --no-cache

COPY . /app
RUN yarn build

EXPOSE 3000
USER node
ENV NODE_ENV production

ENTRYPOINT [ "node", "--max_old_space_size=400" ]
CMD [ "bin/www" ]
