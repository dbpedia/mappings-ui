FROM node:6
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN cp .env /usr/scr/app 2>/dev/null || :
ENV NPM_CONFIG_PRODUCTION false
RUN npm install
ENV NODE_ENV production
COPY . /usr/src/app

EXPOSE 8000
CMD [ "/bin/bash", "start.sh"]