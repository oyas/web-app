FROM node:14-alpine as develop

RUN mkdir -p /app

WORKDIR /app

COPY package*.json ./

RUN npm install
# 本番用にコードを作成している場合
# RUN npm install --only=production

EXPOSE 8000
CMD [ "npm", "start" ]


FROM develop as production

COPY . /app

CMD [ "sh", "-c", "npm run build && npm run serve -- --port 8000" ]