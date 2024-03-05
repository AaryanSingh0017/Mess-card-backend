FROM ghcr.io/puppeteer/puppeteer:22.3.0
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
RUN adduser -D myuser
USER myuser

WORKDIR /usr/src/app
RUN mkdir -p /images

COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node","server.js"]