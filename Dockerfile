FROM cypress/base

RUN mkdir /opt/app
WORKDIR /opt/app

COPY package.json package-lock.json /opt/app/

RUN npm install

COPY . /opt/app

RUN npx cypress verify

CMD [ "npx", "cypress", "run"]