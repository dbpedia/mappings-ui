#Mappings UI Dockerfile
#Ismael Rodriguez (ismaro3)
FROM node:6
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN cp .env /usr/scr/app 2>/dev/null || :

#Node in production mode, but NPM not in order to build frontend files
ENV NPM_CONFIG_PRODUCTION false
ENV NODE_ENV production

#Install dependencies and gulp locally and globally.
RUN npm install
RUN npm install gulp
RUN npm install --global gulp

#Copy files
COPY . /usr/src/app

#Build the frontend files
RUN gulp build

#Run (first set /etc/hosts in docker to point parent host, and then start)
EXPOSE 8000
CMD [ "/bin/sh", "-c", "./docker-set-hosts.sh && ./start.sh"]
