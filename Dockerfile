FROM node:6
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN cp .env /usr/scr/app 2>/dev/null || :
ENV NPM_CONFIG_PRODUCTION false
ENV NODE_ENV production
RUN npm install
RUN npm install gulp
RUN npm install --global gulp
COPY . /usr/src/app
RUN gulp build
EXPOSE 8000
CMD [ "/bin/sh", "-c", "./docker-set-hosts.sh && ./start.sh"]
