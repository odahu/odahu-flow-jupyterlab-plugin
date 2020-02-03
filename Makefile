SHELL := /bin/bash

PROJECTNAME := $(shell basename "$(PWD)")
PYLINT_FOLDER=target/pylint
PYDOCSTYLE_FOLDER=target/pydocstyle
PROJECTS_PYLINT=sdk cli tests
PROJECTS_PYCODESTYLE="sdk cli"
BUILD_PARAMS=
LEGION_VERSION=0.11.0
CREDENTIAL_SECRETS=.secrets.yaml
SANDBOX_PYTHON_TOOLCHAIN_IMAGE=
ROBOT_FILES=**/*.robot
ROBOT_THREADS=6
ROBOT_OPTIONS=-e disable
E2E_PYTHON_TAGS=
COMMIT_ID=
TEMP_DIRECTORY=
BUILD_TAG=
TAG=
# Example of DOCKER_REGISTRY: nexus.domain.com:443/
DOCKER_REGISTRY=
HELM_ADDITIONAL_PARAMS=
# Specify gcp auth keys
GOOGLE_APPLICATION_CREDENTIALS=
MOCKS_DIR=target/mocks
SWAGGER_FILE=
TS_MODEL_DIR=src/odahuflow
SWAGGER_CODEGEN_BIN=java -jar swagger-codegen-cli.jar

DEFAULT_API_ENDPOINT=
ODAHUFLOWCTL_OAUTH_AUTH_URL=
JUPYTER_REDIRECT_URL=
ODAHUFLOWCTL_OAUTH_CLIENT_ID=
ODAHUFLOWCTL_OAUTH_CLIENT_SECRET=

-include .env

.EXPORT_ALL_VARIABLES:

.PHONY: install-all install-cli install-sdk

all: help

check-tag:
	@if [ "${TAG}" == "" ]; then \
	    echo "TAG is not defined, please define the TAG variable" ; exit 1 ;\
	fi
	@if [ "${DOCKER_REGISTRY}" == "" ]; then \
	    echo "DOCKER_REGISTRY is not defined, please define the DOCKER_REGISTRY variable" ; exit 1 ;\
	fi

## install-jupyterlab-plugin: Install python package for JupyterLab
install-jupyterlab-plugin:
	pip3 install ${BUILD_PARAMS} -e .

## docker-build-notebook: Builds docker image with provided parameters
docker-build-notebook.%:
	docker build -t odahu/$*-notebook:${BUILD_TAG} \
	--build-arg NOTEBOOK_TYPE=$* \
	--build-arg ODAHU_PLUGIN_VERSION=${BUILD_TAG} \
	-f containers/jupyter-stacks/Dockerfile .

## docker-build-all-notebooks: Build all necessary types of docker images with ODAHU JupyterLab plugin
docker-build-all-notebooks:  docker-build-notebook.base docker-build-notebook.tensorflow docker-build-notebook.datascience

## docker-push-notebook: Pushes docker image into the registry
docker-push-notebook.%:  check-tag
	docker tag odahu/$*-notebook:${BUILD_TAG} ${DOCKER_REGISTRY}/odahu/$*-notebook:${TAG}
	docker push ${DOCKER_REGISTRY}/odahu/$*-notebook:${TAG}

## docker-push-all-notebooks: Pushes all the listed docker images into the registry
docker-push-all-notebooks:  docker-push-notebook.base docker-push-notebook.tensorflow docker-push-notebook.datascience

## docker-run-notebook.%: Launch a notebook in a docker container. (base, tensorflow, datascience)
docker-run-notebook.%:
	docker run --rm -it -p 8888:8888 \
	    -e DEFAULT_API_ENDPOINT="${DEFAULT_API_ENDPOINT}" \
	    -e ODAHUFLOWCTL_OAUTH_AUTH_URL="${ODAHUFLOWCTL_OAUTH_AUTH_URL}" \
	    -e ODAHUFLOW_OAUTH_CLIENT_ID="${ODAHUFLOW_OAUTH_CLIENT_ID}" \
	    -e ODAHUFLOW_OAUTH_CLIENT_SECRET="${ODAHUFLOW_OAUTH_CLIENT_SECRET}" \
	    -e JUPYTER_REDIRECT_URL="${JUPYTER_REDIRECT_URL}" \
	    odahu/$*-notebook:${BUILD_TAG} "jupyter-lab"

## install-unittests: Install unit tests
install-unittests:
	pip install -e ".[testing]"

## lint: Lints source code
lint:
	pylint odahuflow

## generate-ts-client: Generate typescript models
generate-ts-client:
	mkdir -p ${MOCKS_DIR}
	rm -rf ${MOCKS_DIR}/ts
	$(SWAGGER_CODEGEN_BIN) generate \
		-i ${SWAGGER_FILE} \
		-l typescript-jquery \
		-o ${MOCKS_DIR}/ts \
		--model-package odahuflow

	rm -rf ${TS_MODEL_DIR}
	mkdir -p ${TS_MODEL_DIR}
	cp -r ${MOCKS_DIR}/ts/odahuflow/* ${TS_MODEL_DIR}
	git add ${TS_MODEL_DIR}

## unittests: Run unit tests
unittests:
	mkdir -p target
	mkdir -p target/cover
	DEBUG=true VERBOSE=true pytest packagers/rest

## install-vulnerabilities-checker: Install the vulnerabilities-checker
install-vulnerabilities-checker:
	./scripts/install-git-secrets-hook.sh install_binaries

## check-vulnerabilities: Сheck vulnerabilities in the source code
check-vulnerabilities:
	./scripts/install-git-secrets-hook.sh install_hooks
	git secrets --scan -r

## help: Show the help message
help: Makefile
	@echo "Choose a command run in "$(PROJECTNAME)":"
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sort | sed -e 's/\\$$//' | sed -e 's/##//'
	@echo
