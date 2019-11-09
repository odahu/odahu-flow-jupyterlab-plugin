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
import { ModelTraining } from '../odahuflow/ModelTraining';
import { ModelDeployment } from '../odahuflow/ModelDeployment';
import { Connection } from '../odahuflow/Connection';
import { ModelPackaging } from '../odahuflow/ModelPackaging';
import { PackagingIntegration } from '../odahuflow/PackagingIntegration';
import { ToolchainIntegration } from '../odahuflow/ToolchainIntegration';
import { Configuration } from '../odahuflow/Configuration';

export interface IRemoveRequest {
  id: string;
}

export interface ICloudTrainingLogsRequest {
  id: string;
}

export interface ICloudLogsResponse {
  data: string;
  futureLogsExpected: boolean;
}

/**
 * All data for cloud widget
 */
export interface ICloudAllEntitiesResponse {
  trainings: Array<ModelTraining>;
  deployments: Array<ModelDeployment>;
  connections: Array<Connection>;
  modelPackagings: Array<ModelPackaging>;
  toolchainIntegrations: Array<ToolchainIntegration>;
  packagingIntegrations: Array<PackagingIntegration>;
  configuration: Configuration;
}

export interface IApplyFromFileRequest {
  path: string;
  removal: boolean;
}

export interface IApplyFromFileResponse {
  created: Array<string>;
  changed: Array<string>;
  removed: Array<string>;
  errors: Array<string>;
}
