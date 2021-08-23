variable "IMAGE_TAG" {
    default = "dev"
}

group "default" {
    targets = ["frontend", "bff", "articles", "auth"]
}

group "test" {
    targets = ["articles-test", "auth-test"]
}

target "frontend" {
    context = "frontend/web"
    dockerfile = "Dockerfile"
    tags = ["oyas/web-app-frontend:${IMAGE_TAG}"]
    cache-from = ["type=local,src=.cache/frontend"]
    cache-to = ["type=local,dest=.cache/frontend"]
}

target "bff" {
    context = "backend"
    dockerfile = "Dockerfile.node"
    tags = ["oyas/web-app-bff:${IMAGE_TAG}"]
    cache-from = ["type=local,src=.cache/bff"]
    cache-to = ["type=local,dest=.cache/bff"]
}

target "articles" {
    context = "backend"
    dockerfile = "Dockerfile.go"
    target = "app"
    args = {
        SERVICE_NAME = "articles"
    }
    tags = ["oyas/web-app-articles:${IMAGE_TAG}"]
    cache-from = ["type=local,src=.cache/articles"]
    cache-to = ["type=local,dest=.cache/articles"]
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
    cache-from = ["type=local,src=.cache/auth"]
    cache-to = ["type=local,dest=.cache/auth"]
}

target "auth-test" {
    inherits = ["auth"]
    target = "test"
}
