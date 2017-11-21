
FROM node:alpine

RUN npm install live-server -g

WORKDIR /tmp
COPY package.json /tmp/
RUN yarn install
WORKDIR /var/html/app
COPY . /var/html/app/
RUN cp -a /tmp/node_modules /var/html/app/
RUN npm run build

WORKDIR /var/html/app/dist

EXPOSE 8080

CMD live-server --port=8080 --entry-file=./index.html
