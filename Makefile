NAME := ereese3/gradepub
TAG := $$(git log -1 --pretty=%!H(MISSING))
IMG := ${NAME}:${TAG}
LATEST := ${NAME}:latest

build:
	@docker build -t ${IMG} .
	@docker tag ${IMG} ${LATEST}