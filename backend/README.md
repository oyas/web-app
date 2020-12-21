backend
=====

## compile .proto

```
$ bash build_proto.sh
```

## run server

```
$ go run greeter_server/main.go
```

## run bff

```
$ cd bff
$ npm start
```

## build

```
$ make
```

## build and run greeter\_server and redis

```
$ docker-compose up --build
```
