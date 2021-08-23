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
    cache-from = ["type=gha"]
    cache-to = ["type=gha,mode=max"]
}

target "bff" {
    context = "backend"
    dockerfile = "Dockerfile.node"
    tags = ["oyas/web-app-bff:${IMAGE_TAG}"]
    cache-from = ["type=gha"]
    cache-to = ["type=gha,mode=max"]
}

target "articles" {
    context = "backend"
    dockerfile = "Dockerfile.go"
    target = "app"
    args = {
        SERVICE_NAME = "articles"
    }
    tags = ["oyas/web-app-articles:${IMAGE_TAG}"]
    cache-from = ["type=gha"]
    cache-to = ["type=gha,mode=max"]
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
    cache-from = ["type=gha"]
    cache-to = ["type=gha,mode=max"]
}

target "auth-test" {
    inherits = ["auth"]
    target = "test"
}
