ARG NOTEBOOK_TAG=7a0c7325e470
ARG NOTEBOOK_TYPE=base

FROM jupyter/${NOTEBOOK_TYPE}-notebook:${NOTEBOOK_TAG}

ARG JUPYTERLAB_VERSION=1.2.3
ARG ODAHU_PLUGIN_NAME=odahu-flow-jupyterlab-plugin
ARG ODAHU_PLUGIN_VERSION
ARG PIP_EXTRA_INDEX_URL
ARG NPM_EXTRA_INDEX_URL=https://registry.npmjs.org/

SHELL ["/bin/bash", "-c"]

USER root

RUN apt-get update && apt-get install -y git && \
    rm -rf /var/lib/apt/lists/* \
    && \
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
