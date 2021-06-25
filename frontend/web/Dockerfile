FROM node:15-alpine as develop

RUN mkdir -p /app

WORKDIR /app

EXPOSE 8000

# run develop mode and delete generated files at the end.
CMD sh -c ' \
  trap " \
    echo signal received! finishing...; \
    kill \$(jobs -p); \
    wait; \
  " SIGINT SIGQUIT SIGTERM; \
  npm install && \
  npm run dev -- -p 8000 & \
  wait \
'


FROM develop as production

COPY . /app

RUN npm install && npm run build

RUN rm -rf nodemodules && npm install --only=production

CMD npm run start -- --port 8000
