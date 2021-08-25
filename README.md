Web App test
=====

[![CI/CD](https://github.com/oyas/web-app/actions/workflows/main.yaml/badge.svg)](https://github.com/oyas/web-app/actions/workflows/main.yaml)

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
