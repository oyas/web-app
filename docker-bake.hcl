variable "IMAGE_TAG" {
    default = "dev"
}

variable "CACHE_SRC_DIR" {
    default = ".cache"
}

variable "CACHE_DIST_DIR" {
    default = ".cache"
}

group "default" {
    targets = ["frontend", "bff", "articles", "auth"]
}

group "test" {
    targets = ["articles-test"]
}

target "frontend" {
    context = "frontend/web"
    dockerfile = "Dockerfile"
    tags = ["oyas/web-app-frontend:${IMAGE_TAG}"]
    cache-from = ["type=local,src=${CACHE_SRC_DIR}/frontend"]
    cache-to = ["type=local,dest=${CACHE_DIST_DIR}/frontend,mode=max"]
}

target "bff" {
    context = "backend"
    dockerfile = "Dockerfile.node"
    tags = ["oyas/web-app-bff:${IMAGE_TAG}"]
    cache-from = ["type=local,src=${CACHE_SRC_DIR}/bff"]
    cache-to = ["type=local,dest=${CACHE_DIST_DIR}/bff,mode=max"]
}

target "articles" {
    context = "backend"
    dockerfile = "Dockerfile.go"
    target = "app"
    args = {
        SERVICE_NAME = "articles"
    }
    tags = ["oyas/web-app-articles:${IMAGE_TAG}"]
    cache-from = ["type=local,src=${CACHE_SRC_DIR}/articles"]
    cache-to = ["type=local,dest=${CACHE_DIST_DIR}/articles,mode=max"]
}

target "articles-test" {
    inherits = ["articles"]
    target = "test"
}

target "auth" {
    context = "backend"
    dockerfile = "Dockerfile.go"
    target = "app"
    args = {
        SERVICE_NAME = "auth"
    }
    tags = ["oyas/web-app-auth:${IMAGE_TAG}"]
    cache-from = ["type=local,src=${CACHE_SRC_DIR}/auth"]
    cache-to = ["type=local,dest=${CACHE_DIST_DIR}/auth,mode=max"]
}

target "auth-test" {
    inherits = ["auth"]
    target = "test"
}
