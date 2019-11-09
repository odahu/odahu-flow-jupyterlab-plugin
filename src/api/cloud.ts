/**
 *   Copyright 2019 EPAM Systems
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { ServerConnection } from '@jupyterlab/services';

import {
  httpRequest,
  IApiGroup,
  ICloudCredentials,
  odahuflowApiRootURL
} from './base';
import * as models from '../models/cloud';
import { ModelTraining } from '../odahuflow/ModelTraining';
import { ModelDeployment } from '../odahuflow/ModelDeployment';
import { ModelPackaging } from '../odahuflow/ModelPackaging';
import { Connection } from '../odahuflow/Connection';
import { PackagingIntegration } from '../odahuflow/PackagingIntegration';
import { ToolchainIntegration } from '../odahuflow/ToolchainIntegration';
import { Configuration } from '../odahuflow/Configuration';
import { odahuflowHttpExceptionHandler } from './errorHandler';

export namespace URLs {
  export const configurationUrl = odahuflowApiRootURL + '/cloud/configuration';
  export const cloudConnectionsUrl = odahuflowApiRootURL + '/cloud/connections';
  export const cloudToolchainsUrl = odahuflowApiRootURL + '/cloud/toolchains';
  export const cloudTrainingsUrl = odahuflowApiRootURL + '/cloud/trainings';
  export const cloudPackagingIntegrationUrl =
    odahuflowApiRootURL + '/cloud/packagingintegrations';
  export const cloudModelPackagingUrl =
    odahuflowApiRootURL + '/cloud/modelpackagings';
  export const cloudDeploymentsUrl = odahuflowApiRootURL + '/cloud/deployments';
  export const cloudTrainingLogsUrl =
    odahuflowApiRootURL + '/cloud/trainings/:trainingName:/logs';
  export const cloudPackagingLogsUrl =
    odahuflowApiRootURL + '/cloud/packagings/:packagingName:/logs';
  export const cloudApplyFileUrl = odahuflowApiRootURL + '/cloud/apply';
}

export interface ICloudApi {
  // Trainings
  getModelTrainings: (
    credentials: ICloudCredentials
  ) => Promise<Array<ModelTraining>>;
  getToolchainIntegrations: (
    credentials: ICloudCredentials
  ) => Promise<Array<ToolchainIntegration>>;
  removeCloudTraining: (
    request: models.IRemoveRequest,
    credentials: ICloudCredentials
  ) => Promise<void>;
  getTrainingLogs: (
    request: models.ICloudTrainingLogsRequest,
    credentials: ICloudCredentials
  ) => Promise<models.ICloudLogsResponse>;

  // Connections
  getConnections: (
    credentials: ICloudCredentials
  ) => Promise<Array<Connection>>;
  removeConnection: (
    request: models.IRemoveRequest,
    credentials: ICloudCredentials
  ) => Promise<void>;

  // Packagers
  getModelPackagings: (
    credentials: ICloudCredentials
  ) => Promise<Array<ModelPackaging>>;
  getPackagingIntegrations: (
    credentials: ICloudCredentials
  ) => Promise<Array<PackagingIntegration>>;
  removeModelPackaging: (
    request: models.IRemoveRequest,
    credentials: ICloudCredentials
  ) => Promise<void>;
  getPackagingLogs: (
    request: models.ICloudTrainingLogsRequest,
    credentials: ICloudCredentials
  ) => Promise<models.ICloudLogsResponse>;

  // Deployments
  getCloudDeployments: (
    credentials: ICloudCredentials
  ) => Promise<Array<ModelDeployment>>;
  createCloudDeployment: (
    request: ModelDeployment,
    credentials: ICloudCredentials
  ) => Promise<ModelDeployment>;
  removeCloudDeployment: (
    request: models.IRemoveRequest,
    credentials: ICloudCredentials
  ) => Promise<void>;

  // Aggregated
  getCloudAllEntities: (
    credentials: ICloudCredentials
  ) => Promise<models.ICloudAllEntitiesResponse>;

  // General
  applyFromFile: (
    request: models.IApplyFromFileRequest,
    credentials: ICloudCredentials
  ) => Promise<models.IApplyFromFileResponse>;

  // Configuration
  getConfiguration: (credentials: ICloudCredentials) => Promise<Configuration>;
}

export class CloudApi implements IApiGroup, ICloudApi {
  // Trainings
  @odahuflowHttpExceptionHandler()
  async getModelTrainings(
    credentials: ICloudCredentials
  ): Promise<Array<ModelTraining>> {
    let response = await httpRequest(
      URLs.cloudTrainingsUrl,
      'GET',
      null,
      credentials
    );
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return response.json();
  }

  @odahuflowHttpExceptionHandler()
  async getToolchainIntegrations(
    credentials: ICloudCredentials
  ): Promise<Array<ToolchainIntegration>> {
    let response = await httpRequest(
      URLs.cloudToolchainsUrl,
      'GET',
      null,
      credentials
    );
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return response.json();
  }

  @odahuflowHttpExceptionHandler()
  async getTrainingLogs(
    request: models.ICloudTrainingLogsRequest,
    credentials: ICloudCredentials
  ): Promise<models.ICloudLogsResponse> {
    const url = URLs.cloudTrainingLogsUrl.replace(':trainingName:', request.id);
    let response = await httpRequest(url, 'GET', undefined, credentials);
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return response.json();
  }

  @odahuflowHttpExceptionHandler()
  async removeCloudTraining(
    request: models.IRemoveRequest,
    credentials: ICloudCredentials
  ): Promise<void> {
    let response = await httpRequest(
      URLs.cloudTrainingsUrl,
      'DELETE',
      request,
      credentials
    );
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return null;
  }

  // Connections
  @odahuflowHttpExceptionHandler()
  async getConnections(
    credentials: ICloudCredentials
  ): Promise<Array<Connection>> {
    let response = await httpRequest(
      URLs.cloudConnectionsUrl,
      'GET',
      null,
      credentials
    );
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return response.json();
  }

  @odahuflowHttpExceptionHandler()
  async removeConnection(
    request: models.IRemoveRequest,
    credentials: ICloudCredentials
  ): Promise<void> {
    let response = await httpRequest(
      URLs.cloudConnectionsUrl,
      'DELETE',
      request,
      credentials
    );
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return null;
  }

  // Packaging
  @odahuflowHttpExceptionHandler()
  async getModelPackagings(
    credentials: ICloudCredentials
  ): Promise<Array<ModelPackaging>> {
    let response = await httpRequest(
      URLs.cloudModelPackagingUrl,
      'GET',
      null,
      credentials
    );
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return response.json();
  }

  @odahuflowHttpExceptionHandler()
  async getPackagingIntegrations(
    credentials: ICloudCredentials
  ): Promise<Array<PackagingIntegration>> {
    let response = await httpRequest(
      URLs.cloudPackagingIntegrationUrl,
      'GET',
      null,
      credentials
    );
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return response.json();
  }

  @odahuflowHttpExceptionHandler()
  async removeModelPackaging(
    request: models.IRemoveRequest,
    credentials: ICloudCredentials
  ): Promise<void> {
    let response = await httpRequest(
      URLs.cloudModelPackagingUrl,
      'DELETE',
      request,
      credentials
    );
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return null;
  }

  @odahuflowHttpExceptionHandler()
  async getPackagingLogs(
    request: models.ICloudTrainingLogsRequest,
    credentials: ICloudCredentials
  ): Promise<models.ICloudLogsResponse> {
    const url = URLs.cloudPackagingLogsUrl.replace(
      ':packagingName:',
      request.id
    );
    let response = await httpRequest(url, 'GET', undefined, credentials);
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return response.json();
  }

  // Deployments
  @odahuflowHttpExceptionHandler()
  async getCloudDeployments(
    credentials: ICloudCredentials
  ): Promise<Array<ModelDeployment>> {
    let response = await httpRequest(
      URLs.cloudDeploymentsUrl,
      'GET',
      null,
      credentials
    );
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return response.json();
  }

  @odahuflowHttpExceptionHandler()
  async createCloudDeployment(
    request: ModelDeployment,
    credentials: ICloudCredentials
  ): Promise<ModelDeployment> {
    let response = await httpRequest(
      URLs.cloudDeploymentsUrl,
      'POST',
      request,
      credentials
    );
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return response.json();
  }

  @odahuflowHttpExceptionHandler()
  async removeCloudDeployment(
    request: models.IRemoveRequest,
    credentials: ICloudCredentials
  ): Promise<void> {
    let response = await httpRequest(
      URLs.cloudDeploymentsUrl,
      'DELETE',
      request,
      credentials
    );
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return null;
  }

  // Aggregated
  @odahuflowHttpExceptionHandler()
  async getCloudAllEntities(
    credentials: ICloudCredentials
  ): Promise<models.ICloudAllEntitiesResponse> {
    return Promise.all([
      this.getConfiguration(credentials),
      this.getConnections(credentials),
      this.getModelTrainings(credentials),
      this.getToolchainIntegrations(credentials),
      this.getModelPackagings(credentials),
      this.getPackagingIntegrations(credentials),
      this.getCloudDeployments(credentials)
    ]).then(function(values) {
      let [
        configuration,
        connections,
        trainings,
        toolchains,
        packagings,
        packagingsIntegrations,
        deployments
      ] = values;

      return {
        configuration: configuration,
        connections: connections,
        trainings: trainings,
        toolchainIntegrations: toolchains,
        modelPackagings: packagings,
        packagingIntegrations: packagingsIntegrations,
        deployments: deployments
      };
    });
  }

  // General
  @odahuflowHttpExceptionHandler()
  async applyFromFile(
    request: models.IApplyFromFileRequest,
    credentials: ICloudCredentials
  ): Promise<models.IApplyFromFileResponse> {
    let response = await httpRequest(
      URLs.cloudApplyFileUrl,
      'POST',
      request,
      credentials
    );
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return response.json();
  }

  // Configuration
  @odahuflowHttpExceptionHandler()
  async getConfiguration(
    credentials: ICloudCredentials
  ): Promise<Configuration> {
    let response = await httpRequest(
      URLs.configurationUrl,
      'GET',
      null,
      credentials
    );
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return response.json();
  }
}
