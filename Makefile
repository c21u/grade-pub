NAME := 332672892491.dkr.ecr.us-east-1.amazonaws.com/eduapps/gradepub
TAG := $$(git describe)
IMG := ${NAME}:${TAG}
LATEST := ${NAME}:latest

build:
	@docker build -t ${IMG} .
	@docker tag ${IMG} ${LATEST}

push:
	@docker push ${NAME}
