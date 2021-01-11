FROM node:14-alpine as develop

RUN mkdir -p /app

WORKDIR /app

EXPOSE 8000

# run develop mode and delete generated files at the end.
CMD sh -c ' \
  trap " \
    echo signal received! finishing...; \
    kill \$(jobs -p); \
    wait; \
    npm run clean \
  " SIGINT SIGQUIT SIGTERM; \
  npm install && \
  npm run develop & \
  wait \
'


FROM develop as production

COPY . /app

RUN npm install --only=production

CMD sh -c "npm run build && npm run serve -- --port 8000"
