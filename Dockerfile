FROM node:12
WORKDIR /usr/src/app
COPY . .
RUN npm install -g && npm install -D
ENTRYPOINT ["/usr/local/bin/redlab"]
