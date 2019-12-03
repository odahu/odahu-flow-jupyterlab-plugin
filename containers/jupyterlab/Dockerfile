#
#    Copyright 2018 EPAM Systems
#
#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.
#
# Args to build
ARG JUPYTERLAB_VERSION=1.2.3

# Image for building ready-to-distribute plugin frontend
FROM python:3.6.8-stretch AS plugin-frontend-rebuilder
ARG JUPYTERLAB_VERSION

ENV WORK_DIR="/opt/odahu-flow-plugin"
WORKDIR "${WORK_DIR}/"

RUN \
  apt-get update && \
  apt-get install -yqq apt-transport-https && \
  echo "deb https://deb.nodesource.com/node_10.x stretch main" > /etc/apt/sources.list.d/nodesource.list && \
  wget -qO- https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list && \
  wget -qO- https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  apt-get update && \
  apt-get install -yqq nodejs yarn && \
  pip install -U pip && pip install pipenv && \
  npm i -g npm@^6 && \
  rm -rf /var/lib/apt/lists/*

# Install jupyterlab
RUN pip3 install --disable-pip-version-check jupyterlab==$JUPYTERLAB_VERSION

COPY package.json yarn.lock "${WORK_DIR}/"

RUN yarn install --non-interactive --ignore-scripts

COPY tsconfig.json tslint.json "${WORK_DIR}/"
COPY src "${WORK_DIR}/src"
COPY style "${WORK_DIR}/style"
COPY jupyter-config "${WORK_DIR}/jupyter-config"

RUN yarn build && npm pack .

# Run installation w/o any code to warm up nodejs cache
RUN jupyter lab build && mv /opt/odahu-flow-plugin/odahu-flow-jupyterlab-plugin-*.tgz jupyter_odahuflow.tgz

RUN jupyter labextension install --no-build jupyter_odahuflow.tgz && \
    jupyter labextension install @jupyterlab/git jupyterlab_toastify jupyterlab-jupytext

# We have to remove folder with node_modules and other build-related staff that is not required for running
RUN rm -rf /usr/local/share/jupyter/lab/staging

# Main image
FROM python:3.6.8-stretch
ARG JUPYTERLAB_VERSION
SHELL ["/bin/bash", "-c"]

ENV WORK_DIR="/opt/odahu-flow"
WORKDIR "${WORK_DIR}/"
ARG MINICONDA_URL=https://repo.anaconda.com/miniconda/Miniconda3-4.5.11-Linux-x86_64.sh
# Install conda
RUN apt-get update -y && apt-get install -y wget git && \
    wget https://github.com/krallin/tini/releases/download/v0.18.0/tini-amd64 -qO /bin/tiny && \
    chmod a+x /bin/tiny && \
    wget ${MINICONDA_URL} -O ~/miniconda.sh && \
    /bin/bash ~/miniconda.sh -b -p /opt/conda && \
    rm ~/miniconda.sh && \
    /opt/conda/bin/conda clean -tipsy && \
    ln -s /opt/conda/etc/profile.d/conda.sh /etc/profile.d/conda.sh && \
    ln -s /opt/conda/bin/conda /usr/bin/conda
RUN  pip install --disable-pip-version-check --upgrade pip==19.2.2 pipenv==2018.10.13 ptvsd==4.2.2 jupyterlab==$JUPYTERLAB_VERSION

COPY containers/jupyterlab/odahuflow-doc.txt /opt/odahu-flow/
COPY containers/jupyterlab/conda-update.sh /usr/bin/conda-update

COPY ./ "${WORK_DIR}/"
RUN pip3 install -e .

COPY --from=plugin-frontend-rebuilder /usr/local/share/jupyter /usr/local/share/jupyter

RUN pip3 install jupyterlab-git jupytext && \
    jupyter serverextension enable --py odahuflow.jupyterlab && \
    jupyter serverextension enable --py jupyterlab_git && \
    jupyter nbextension install --py jupytext && \
    jupyter nbextension enable --py jupytext && \
    echo '[ ! -z "$TERM" -a -r /etc/motd ] && cat /etc/motd' >> /etc/bash.bashrc && \
    cat /opt/odahu-flow/odahuflow-doc.txt > /etc/motd

COPY containers/jupyterlab/jupyter_notebook_config.py /etc/jupyter/

# Replace build working directory with empty directory
RUN mkdir -p "${WORK_DIR}/workdir"
WORKDIR "${WORK_DIR}/workdir"