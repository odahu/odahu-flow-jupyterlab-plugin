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

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ServiceManager } from '@jupyterlab/services';
import { JupyterLab } from '@jupyterlab/application';

import { BaseOdahuflowWidget, IWidgetOptions } from './Widgets';

import { CloudWidgetView } from './CloudWidgetView';

export interface IOdahuflowSideWidgetExternalOptions extends IWidgetOptions {
  /**
   * A service manager instance.
   */
  manager: ServiceManager.IManager;

  /**
   * Current data state
   */
  state: any;
}

export interface IOdahuflowSideWidgetOptions
  extends IOdahuflowSideWidgetExternalOptions {
  targetReactComponent: any;
}

export class OdahuflowSideWidget extends BaseOdahuflowWidget {
  component: any;

  /**
   * Construct a new running widget.
   */
  constructor(app: JupyterLab, options: IOdahuflowSideWidgetOptions) {
    super(options);

    const element = (
      <options.targetReactComponent app={app} dataState={options.state} />
    );
    this.component = ReactDOM.render(element, this.node);
    this.component.refresh();
  }
}

export function createCloudSidebarWidget(
  app: JupyterLab,
  options: IOdahuflowSideWidgetExternalOptions
): OdahuflowSideWidget {
  const extendedOptions = {
    ...options,
    targetReactComponent: CloudWidgetView
  };
  return new OdahuflowSideWidget(app, extendedOptions);
}
