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
CLUSTER_NAME=
E2E_PYTHON_TAGS=
COMMIT_ID=
TEMP_DIRECTORY=
BUILD_TAG=latest
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

HIERA_KEYS_DIR=
ODAHUFLOW_PROFILES_DIR=

CLUSTER_NAME=
CLOUD_PROVIDER=

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

## docker-build-python-toolchain: Build python toolchain docker image
docker-build-jupyterlab:
	docker build -t odahu/jupyterlab:${BUILD_TAG} -f containers/jupyterlab/Dockerfile .

## docker-push-jupyterlab: Push python toolchain docker image
docker-push-jupyterlab:  check-tag
	docker tag odahu/jupyterlab:${BUILD_TAG} ${DOCKER_REGISTRY}/odahu/jupyterlab:${TAG}
	docker push ${DOCKER_REGISTRY}/odahu/jupyterlab:${TAG}

## helm-install: Install the odahu-flow jupyterlab helm chart from source code
helm-install: helm-delete
	helm install helms/jupyterlab --atomic --wait --timeout 320 --namespace odahu-flow --name odahu-flow-jupyterlab --debug ${HELM_ADDITIONAL_PARAMS}

## helm-delete: Delete the odahu-flow helm release
helm-delete:
	helm delete --purge odahu-flow-jupyterlab || true

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

## run-sandbox: Start Python toolchain sandbox
run-sandbox:
	odahuflowctl sandbox --image odahu/jupyterlab:${BUILD_TAG}

	./odahu-flow-activate.sh

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