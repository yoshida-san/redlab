FROM node:12
WORKDIR /usr/src/app
COPY . .
RUN npm install -g
ENTRYPOINT ["/usr/local/bin/redlab"]
