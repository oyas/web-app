FROM node:14-alpine

RUN mkdir -p /app

WORKDIR /app

COPY package*.json ./

RUN npm install
# 本番用にコードを作成している場合
# RUN npm install --only=production

COPY . /app

EXPOSE 8000
CMD [ "npm", "start" ]
