FROM node:18
# FROM --platform=linux/amd64 node:18

WORKDIR /app

COPY . .

RUN npm i

RUN npm i pm2 -g

RUN npm run build 

EXPOSE 8080

COPY .env /app/dist

ENTRYPOINT ["pm2-runtime", "start", "/app/dist/main.js", "-i", "max"]