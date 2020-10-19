ARG NOTEBOOK_TAG=7a0c7325e470
ARG NOTEBOOK_TYPE=base

FROM jupyter/${NOTEBOOK_TYPE}-notebook:${NOTEBOOK_TAG}

ARG JUPYTERLAB_VERSION=1.2.3
ARG AWS_CLI_VERSION=2.0.57
ARG GCLOUD_CLI_VERSION=314.0.0-0
ARG AZURE_CLI_VERSION=2.13.0-1~focal
ARG ODAHU_PLUGIN_NAME=odahu-flow-jupyterlab-plugin
ARG ODAHU_PLUGIN_VERSION
ARG PIP_EXTRA_INDEX_URL
ARG NPM_EXTRA_INDEX_URL=https://registry.npmjs.org/

SHELL ["/bin/bash", "-c"]

USER root


RUN apt-get update && apt-get install -y git unzip groff less curl apt-transport-https ca-certificates lsb-release gnupg && \
    curl -sL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | tee /etc/apt/trusted.gpg.d/microsoft.gpg > /dev/null && \
    echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/azure-cli.list && \
    echo "deb https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add - && \
    apt-get update && \
    apt-get install -y google-cloud-sdk=${GCLOUD_CLI_VERSION} azure-cli=${AZURE_CLI_VERSION} && \
    rm -rf /var/lib/apt/lists/* && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64-${AWS_CLI_VERSION}.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm awscliv2.zip && \
    pip install --no-cache-dir \
    jupyterlab==${JUPYTERLAB_VERSION} \
    jupytext==1.1.7 \
    jupyterlab-git \
    ${ODAHU_PLUGIN_NAME}==${ODAHU_PLUGIN_VERSION//-/}

RUN jupyter serverextension enable --sys-prefix --py odahuflow.jupyterlab && \
    jupyter serverextension enable --sys-prefix --py jupyterlab_git && \
    jupyter nbextension install --sys-prefix --py jupytext && \
    jupyter nbextension enable --sys-prefix --py jupytext

RUN jupyter labextension install ${NPM_EXTRA_INDEX_URL}/${ODAHU_PLUGIN_NAME}/-/${ODAHU_PLUGIN_NAME}-${ODAHU_PLUGIN_VERSION}.tgz

USER $NB_UID
