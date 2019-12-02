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
import { JupyterLab } from '@jupyterlab/application';
import { ServiceManager } from '@jupyterlab/services';
import { ISplashScreen, WidgetTracker } from '@jupyterlab/apputils';
import { FileBrowser } from '@jupyterlab/filebrowser';
import { Widget } from '@phosphor/widgets';

import { IApiCloudState } from '../models';
import { IOdahuflowApi } from '../api';
import { WidgetRegistry } from '../components/Widgets';
import { IConfigurationMainResponse } from '../models/configuration';

/**
 * CommandIDs contains IDs of all Odahuflow commands.
 * This commands can be used outside of Odahuflow system.
 */
export namespace CommandIDs {
  // UI
  export const openCloudModelPlugin = 'odahuflow:ui-cloud-mode';
  export const mainRepository = 'odahuflow:main-repository';

  // Authorize
  export const unAuthorizeOnCluster = 'odahuflow:cloud-reset-auth';
  export const authorizeOnCluster = 'odahuflow:cloud-start-auth';

  // Cloud
  export const removeConnection = 'odahuflow:connection-remove';
  export const removeModelPackaging = 'odahuflow:modelpackaging-remove';
  export const removeCloudTraining = 'odahuflow:cloud-training-remove';
  export const newCloudDeployment = 'odahuflow:cloud-deployment-new';
  export const removeCloudDeployment = 'odahuflow:cloud-deployment-remove';
  export const openTrainingLogs = 'odahuflow:cloud-training-logs';
  export const openPackagingLogs = 'odahuflow:cloud-packaging-logs';
  export const applyCloudResources = 'odahuflow:resources:apply';
  export const removeCloudResources = 'odahuflow:resources:remove';
  export const condaUpdateEnv = 'odahuflow:resources:conda_env';

  // Settings
  export const refreshCloud = 'odahuflow:refresh-cloud-mode';

  export const palleteCommands = [
    // UI
    openCloudModelPlugin,
    mainRepository,
    // Authorize
    unAuthorizeOnCluster,
    authorizeOnCluster,

    // Cloud
    removeCloudDeployment,
    refreshCloud
  ];
}

export interface IAddCommandsOptions {
  app: JupyterLab;
  tracker: WidgetTracker<FileBrowser>;
  services: ServiceManager;
  api: IOdahuflowApi;
  splash: ISplashScreen;
}

export interface IAddCloudCommandsOptions extends IAddCommandsOptions {
  config: IConfigurationMainResponse;
  state: IApiCloudState;
  trainingLogs: WidgetRegistry<Widget>;
  packagingLogs: WidgetRegistry<Widget>;
}
