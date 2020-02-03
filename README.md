# odahuflow

Integration with Odahu (Cluster and Local modes)

## Prerequisites

* JupyterLab (version > 1.2)
* odahu-flow-sdk python package

## Installation

```bash
jupyter labextension install jupyter_odahuflow
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
npm run build
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

## Docker images

ODAHU expands the following [jupyterhub images](https://github.com/jupyter/docker-stacks)
by installing the ODAHU Flow plugin:
* base
* datascience
* tensorflow

You can find the prebuilt image [here](https://hub.docker.com/u/odahu).

Execute the following steps to build and run an image locally, for example the base type:

```bash
# Specify the version of the odahu flow plugin.
# You can find the all variables here https://docs.odahu.org/int_jupyterlab_extension.html#configuration
echo "BUILD_TAG=1.1.0" >> .env

make docker-build-notebook.base
make docker-run-notebook.base
```

## Third-party components

### Icons
* cloud - https://www.iconfinder.com/icons/211653/cloud_icon
* gears - https://www.iconfinder.com/icons/1608900/gears_icon
* lock - https://www.iconfinder.com/icons/1608769/lock_icon
