Web App test
=====

[![CI](https://github.com/oyas/web-app/actions/workflows/ci.yaml/badge.svg)](https://github.com/oyas/web-app/actions/workflows/ci.yaml)
[![CD](https://github.com/oyas/web-app/actions/workflows/cd.yaml/badge.svg)](https://github.com/oyas/web-app/actions/workflows/cd.yaml)

Infra repository: [web-app-infra](https://github.com/oyas/web-app-infra)


## Setup

```
$ bash ./setup.sh
```


## Run

```
$ docker-compose up
```

open http://localhost:9000/ in your browser


## Build images

```
$ docker buildx bake -f docker-bake.hcl
```


## Test

```
$ docker buildx bake -f docker-bake.hcl test
```

aaaaaa
