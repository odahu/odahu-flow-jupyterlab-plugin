#
#    Copyright 2019 EPAM Systems
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
"""
Declaration of cloud handlers
"""
import os
from typing import List, Dict, Tuple

from tornado.web import HTTPError

from odahuflow.jupyterlab.handlers.base import BaseOdahuflowHandler
from odahuflow.jupyterlab.handlers.datamodels.cloud import *  # pylint: disable=W0614, W0401
from odahuflow.jupyterlab.handlers.helper import decorate_handler_for_exception, DEFAULT_API_ENDPOINT, \
    decorate_async_handler_for_exception
from odahuflow.sdk.clients.configuration import AsyncConfigurationClient
from odahuflow.sdk.clients.connection import AsyncConnectionClient
from odahuflow.sdk.clients.deployment import ModelDeployment, AsyncModelDeploymentClient
from odahuflow.sdk.clients.api import APIConnectionException, RemoteAPIClient
from odahuflow.sdk.clients.api_aggregated import parse_resources_file, async_apply, OdahuflowCloudResourceUpdatePair
from odahuflow.sdk.clients.packaging import AsyncModelPackagingClient
from odahuflow.sdk.clients.packaging_integration import AsyncPackagingIntegrationClient
from odahuflow.sdk.clients.toolchain_integration import AsyncToolchainIntegrationClient
from odahuflow.sdk.clients.training import ModelTraining, \
    TRAINING_SUCCESS_STATE, TRAINING_FAILED_STATE, AsyncModelTrainingClient
from odahuflow.sdk.models import ModelPackaging
from odahuflow.sdk.models.base_model_ import Model

ODAHUFLOW_CLOUD_CREDENTIALS_EDI = 'X-Odahuflow-Cloud-Endpoint'
ODAHUFLOW_CLOUD_CREDENTIALS_TOKEN = 'X-Odahuflow-Cloud-Token'


def _convert_to_dict(entities: List[Model]) -> List[Dict]:
    """
    Convert all Odahuflow entities to the dict
    :param entities: Odahuflow entities
    :return: list with converted Odahuflow entities
    """
    return [ent.to_dict() for ent in entities]


# pylint: disable=W0223
class BaseCloudOdahuflowHandler(BaseOdahuflowHandler):
    """
    Base handler for cloud API
    """

    def build_cloud_client(self, target_client_class):
        """
        Build client for REST API

        :param target_client_class: target client's class
        :return: instance of target_client_class class
        """
        default_api_url = os.getenv(DEFAULT_API_ENDPOINT, '')
        jwt_header = self.get_token_from_header()

        api_url = self.request.headers.get(ODAHUFLOW_CLOUD_CREDENTIALS_EDI, '')
        if not api_url:
            api_url = default_api_url

        api_token = self.request.headers.get(ODAHUFLOW_CLOUD_CREDENTIALS_TOKEN, '')
        if jwt_header:
            api_token = jwt_header

        if not api_url:
            raise HTTPError(log_message='Credentials are corrupted')

        return target_client_class(api_url, api_token)


class CloudModelPackagingHandler(BaseCloudOdahuflowHandler):
    """
    Control model packagings
    """

    @decorate_async_handler_for_exception
    async def get(self):
        """
        Get all model packagings

        :return: None
        """
        client: AsyncModelPackagingClient = self.build_cloud_client(AsyncModelPackagingClient)

        self.finish_with_json(_convert_to_dict(await client.get_all()))

    @decorate_async_handler_for_exception
    async def delete(self):
        """
        Remove model packaging

        :return: None
        """
        data = BasicIdRequest(**self.get_json_body())

        try:
            client: AsyncModelPackagingClient = self.build_cloud_client(AsyncModelPackagingClient)
            await client.delete(data.id)
            self.finish_with_json()
        except Exception as query_exception:
            raise HTTPError(log_message='Can not remove cluster model packaging') from query_exception


class CloudUrlInfo(BaseCloudOdahuflowHandler):
    """
    Control model packagings
    """

    @decorate_handler_for_exception
    def get(self):
        """
        Remove model packaging

        :return: None
        """
        self.finish_with_json({
            'ediUrl': os.getenv('ODAHUFLOW_EDI_URL', ''),
            'metricUiUrl': os.getenv('ODAHUFLOW_METRIC_UI_URL', ''),
        })


class CloudTrainingsHandler(BaseCloudOdahuflowHandler):
    """
    Control cloud trainings
    """

    @decorate_async_handler_for_exception
    async def get(self):
        """
        Get all trainings

        :return: None
        """
        client: AsyncModelTrainingClient = self.build_cloud_client(AsyncModelTrainingClient)

        self.finish_with_json(_convert_to_dict(await client.get_all()))

    @decorate_async_handler_for_exception
    async def delete(self):
        """
        Remove cloud training

        :return: None
        """
        data = BasicIdRequest(**self.get_json_body())

        try:
            client: AsyncModelTrainingClient = self.build_cloud_client(AsyncModelTrainingClient)
            await client.delete(data.id)
            self.finish_with_json()
        except Exception as query_exception:
            raise HTTPError(log_message='Can not remove cluster model training') from query_exception


class CloudConnectionHandler(BaseCloudOdahuflowHandler):
    """
    Control cloud connections
    """

    @decorate_async_handler_for_exception
    async def get(self):
        """
        Get all connections

        :return: None
        """
        client: AsyncConnectionClient = self.build_cloud_client(AsyncConnectionClient)

        self.finish_with_json(_convert_to_dict(await client.get_all()))

    @decorate_async_handler_for_exception
    async def delete(self):
        """
        Remove cloud training

        :return: None
        """
        data = BasicIdRequest(**self.get_json_body())

        try:
            client: AsyncConnectionClient = self.build_cloud_client(AsyncConnectionClient)
            await client.delete(data.id)
            self.finish_with_json()
        except Exception as query_exception:
            raise HTTPError(log_message='Can not remove cluster model training') from query_exception


class CloudTrainingLogsHandler(BaseCloudOdahuflowHandler):
    """
    Control cloud training logs
    """

    @decorate_async_handler_for_exception
    async def get(self, training_name):
        """
        Get training logs

        :arg training_name: name of training
        :return: None
        """
        client: AsyncModelTrainingClient = self.build_cloud_client(AsyncModelTrainingClient)
        training: ModelTraining = await client.get(training_name)

        self.finish_with_json({
            'futureLogsExpected': training.status.state not in (TRAINING_SUCCESS_STATE, TRAINING_FAILED_STATE),
            'data': '\n'.join([chunk async for chunk in client.log(training_name)])
        })


class CloudPackagingLogsHandler(BaseCloudOdahuflowHandler):
    """
    Control cloud training logs
    """

    @decorate_async_handler_for_exception
    async def get(self, packaging_name):
        """
        Get training logs

        :arg packaging_name: name of training
        :return: None
        """
        client: AsyncModelPackagingClient = self.build_cloud_client(AsyncModelPackagingClient)
        mp: ModelPackaging = await client.get(packaging_name)

        self.finish_with_json({
            'futureLogsExpected': mp.status.state not in (TRAINING_SUCCESS_STATE, TRAINING_FAILED_STATE),
            'data': '\n'.join([chunk async for chunk in client.log(packaging_name)])
        })


class CloudPackagingIntegrationsHandler(BaseCloudOdahuflowHandler):
    """
    Control cloud training logs
    """

    @decorate_async_handler_for_exception
    async def get(self):
        """
        Get all packaging integrations

        :return: None
        """
        client: AsyncPackagingIntegrationClient = self.build_cloud_client(AsyncPackagingIntegrationClient)

        self.finish_with_json(_convert_to_dict(await client.get_all()))


class CloudToolchainIntegrationsHandler(BaseCloudOdahuflowHandler):
    """
    Control cloud training logs
    """

    @decorate_async_handler_for_exception
    async def get(self):
        """
        Get all toolchain intergrations

        :return: None
        """
        client: AsyncToolchainIntegrationClient = self.build_cloud_client(AsyncToolchainIntegrationClient)

        self.finish_with_json(_convert_to_dict(await client.get_all()))


class CloudConfigurationHandler(BaseCloudOdahuflowHandler):
    """
    Control cloud training logs
    """

    @decorate_async_handler_for_exception
    async def get(self):
        """
        Get odahuflow configuration

        :return: None
        """
        client: AsyncConfigurationClient = self.build_cloud_client(AsyncConfigurationClient)

        self.finish_with_json((await client.get()).to_dict())


class CloudDeploymentsHandler(BaseCloudOdahuflowHandler):
    """
    Control cloud deployments
    """

    @decorate_async_handler_for_exception
    async def get(self):
        """
        Get all packaging integrations

        :return: None
        """
        client: AsyncModelDeploymentClient = self.build_cloud_client(AsyncModelDeploymentClient)

        self.finish_with_json(_convert_to_dict(await client.get_all()))

    @decorate_async_handler_for_exception
    async def post(self):
        """
        Create new cloud deployment

        :return: None
        """
        md = ModelDeployment.from_dict(self.get_json_body())

        try:
            client: AsyncModelDeploymentClient = self.build_cloud_client(AsyncModelDeploymentClient)
            await client.create(md)
            self.finish_with_json()
        except Exception as query_exception:
            raise HTTPError(log_message='Can not create new cloud deployment') from query_exception

    @decorate_async_handler_for_exception
    async def delete(self):
        """
        Remove local deployment

        :return: None
        """
        data = BasicIdRequest(**self.get_json_body())

        try:
            client: AsyncModelDeploymentClient = self.build_cloud_client(AsyncModelDeploymentClient)
            await client.delete(data.id)
        except Exception as query_exception:
            raise HTTPError(log_message='Can not remove cluster model deployment') from query_exception

        self.finish_with_json()


class CloudApplyFromFileHandler(BaseCloudOdahuflowHandler):
    """
    Apply (create/update/delete) entities from file
    """

    @staticmethod
    def _prepare_resources_list(resources: Tuple[OdahuflowCloudResourceUpdatePair]) -> List[str]:
        """
        Prepare resources list to output

        :param resources: resources to output
        :return: response
        """
        return [f'{type(resource.resource).__name__} {resource.resource_id}' for resource in resources]

    @decorate_async_handler_for_exception
    async def post(self):
        """
        Apply entities from JSON/YAML file

        :return: None
        """
        data = ApplyFromFileRequest(**self.get_json_body())
        client = self.build_cloud_client(RemoteAPIClient)

        try:
            resources = parse_resources_file(data.path)
        except Exception as parse_exception:
            raise HTTPError(
                log_message=f'Can not parse resources file {data.path}: {parse_exception}'
            ) from parse_exception

        try:
            result = await async_apply(resources, client, data.removal)
        except APIConnectionException as edi_exception:
            raise edi_exception
        except Exception as apply_exception:
            raise HTTPError(
                log_message=f'Can not apply changes from resources file {data.path}: {apply_exception}'
            ) from apply_exception

        self.finish_with_json({
            'created': self._prepare_resources_list(result.created),
            'changed': self._prepare_resources_list(result.changed),
            'removed': self._prepare_resources_list(result.removed),
            'errors': [str(err) for err in result.errors],
        })
