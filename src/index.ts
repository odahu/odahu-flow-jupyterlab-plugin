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
import {
  ILayoutRestorer,
  JupyterLab,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  Dialog,
  ISplashScreen,
  showDialog,
  showErrorMessage
} from '@jupyterlab/apputils';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { Menu, Widget } from '@phosphor/widgets';
import { CommandRegistry } from '@phosphor/commands';
import { Token } from '@phosphor/coreutils';

import '../style/variables.css';

import { cloudModeTabStyle } from './componentsStyle/GeneralWidgetStyle';

import { WidgetRegistry } from './components/Widgets';

import {
  createCloudSidebarWidget,
  OdahuflowSideWidget
} from './components/SideWidgets';
import { CloudTrainingLogsWidget } from './components/CloudTrainingLogsWidget';
import { addCloudCommands, CommandIDs } from './commands';

import { OdahuflowApi } from './api';
import { buildInitialCloudAPIState, IApiCloudState } from './models/apiState';
import { ILauncher } from '@jupyterlab/launcher';
import { CloudPackagingLogsWidget } from './components/CloudPackingLogsWidget';
import { OpenTemplateWidget } from './components/OpenTemplateWidget';

export const PLUGIN_ID = 'jupyter.extensions.odahuflow';
export const PLUGIN_ID_CLOUD = PLUGIN_ID + ':cloud';
export const EXTENSION_ID = 'jupyter.extensions.jupyter_odahuflow';

const OPEN_COMMAND = 'template:open';
const FILE_MANAGER_ODAHUFLOW_RESOURCES = [
  '.jp-DirListing-item[title$=".yaml"]',
  '.jp-DirListing-item[title$=".yml"]',
  '.jp-DirListing-item[title$=".json"]'
];
const CONDA_FILES = '.jp-DirListing-item[title*="conda.yaml"]';
const APPLY_ODAHUFLOW_RESOURCES = 100;
const CONDA_RESOURCES = 101;

// tslint:disable-next-line: variable-name
export const IOdahuflowExtension = new Token<IOdahuflowExtension>(EXTENSION_ID);

/** Interface for extension class */
export interface IOdahuflowExtension {}

const pluginRequirements = [
  IMainMenu,
  ILayoutRestorer,
  ISplashScreen,
  IFileBrowserFactory
];

/**
 * Plugins declarations
 */
const cloudPlugin: JupyterFrontEndPlugin<IOdahuflowExtension> = {
  id: PLUGIN_ID_CLOUD,
  requires: pluginRequirements,
  provides: IOdahuflowExtension,
  optional: [ILauncher],
  activate: activateCloudPlugin,
  autoStart: true
};

/**
 * Export the plugins as default.
 */
const plugins: JupyterFrontEndPlugin<any>[] = [cloudPlugin];
export default plugins;

class BaseOdahuflowExtension {
  /**
   * Instance of Odahuflow Widget for appropriate mode
   */
  sideWidget: OdahuflowSideWidget;

  /**
   * API to back-end
   */
  api: OdahuflowApi;

  /**
   * API state
   */
  apiCloudState?: IApiCloudState;
}

/**
 * Declare extension for cloud mode
 */
export class OdahuflowCloudExtension extends BaseOdahuflowExtension
  implements IOdahuflowExtension {
  private _trainingLogs: WidgetRegistry<Widget>;
  private _packagingLogs: WidgetRegistry<Widget>;
  private _app: JupyterLab;

  private _menu: IMainMenu;
  private _browser: IFileBrowserFactory;
  private _launcher: ILauncher | null;

  /**
   * Construct extension
   * @param app JupyterLab target JupyterLab
   * @param restorer ILayoutRestorer layout restorer
   * @param menu
   * @param browser
   * @param launcher
   */
  constructor(
    app: JupyterLab,
    restorer: ILayoutRestorer,
    menu: IMainMenu,
    browser: IFileBrowserFactory,
    launcher: ILauncher | null
  ) {
    super();

    this._app = app;
    this._menu = menu;
    this._browser = browser;
    this._launcher = launcher;
    this.api = new OdahuflowApi();
    this._trainingLogs = new WidgetRegistry<Widget>(name =>
      this.constructTrainingLogWidget(name)
    );
    this._packagingLogs = new WidgetRegistry<Widget>(name =>
      this.constructPackagingLogWidget(name)
    );

    this.apiCloudState = buildInitialCloudAPIState();
    this.sideWidget = createCloudSidebarWidget(app, {
      manager: app.serviceManager,
      state: this.apiCloudState,
      defaultRenderHolder: 'odahuflow-cloud-sidebar-widget'
    });
    this.sideWidget.id = 'odahuflow-cloud-sessions-widget';
    this.sideWidget.title.iconClass = `jp-SideBar-tabIcon ${cloudModeTabStyle}`;
    this.sideWidget.title.caption = 'Odahuflow cloud mode';

    this.apiCloudState.onDataChanged.connect(_ => this.sideWidget.refresh());

    restorer.add(this.sideWidget, 'odahuflow-cloud-sessions');
    app.shell.add(this.sideWidget, 'left', { rank: 210 });

    app.restored.then(() => {
      this.api.configuration
        .getCloudConfiguration()
        .then(config => {
          this.apiCloudState.onConfigurationLoaded(config);

          this.setupExamples(config.odahuflowResourceExamples);
        })
        .catch(err => {
          console.error('Error during configuration fetching', err);
        });
    });
  }

  private setupExamples(examples: Array<string>): void {
    this._app.commands.addCommand(OPEN_COMMAND, {
      caption: 'Initialize a notebook from a template notebook',
      execute: args => {
        showDialog({
          body: new OpenTemplateWidget(examples),
          buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'GO' })],
          focusNodeSelector: 'input',
          title: 'Template'
        }).then(result => {
          if (result.button.label === 'CANCEL') {
            return;
          }
          if (result.value) {
            this.api.configuration
              .getExampleContent(result.value)
              .then((content: string) => {
                const data = content;
                const path = this._browser.defaultBrowser.model.path;

                return new Promise(resolve => {
                  this._app.commands
                    .execute('docmanager:new-untitled', {
                      path,
                      type: 'file',
                      ext: `.${result.value.toLowerCase()}.odahuflow.yaml`
                    })
                    .then(model => {
                      this._app.commands
                        .execute('docmanager:open', {
                          factory: 'default',
                          path: model.path
                        })
                        .then(widget => {
                          widget.context.ready.then(() => {
                            widget.context.model.fromString(data);
                            resolve(widget);
                          });
                        });
                    });
                });
              });
          }
        });
      },
      iconClass: 'jp-TemplateIcon',
      isEnabled: () => true,
      label: 'Template'
    });

    // Add a launcher item if the launcher is available.
    if (this._launcher) {
      this._launcher.add({
        args: { isLauncher: true, kernelName: 'template' },
        category: 'Odahuflow',
        command: OPEN_COMMAND,
        kernelIconUrl:
          'https://raw.githubusercontent.com/odahuflow-platform/odahuflow/develop/docs/images/odahuflow-logo-h.png',
        rank: 1
      });
    }

    if (this._menu) {
      // Add new text file creation to the file menu.
      this._menu.fileMenu.newMenu.addGroup([{ command: OPEN_COMMAND }], 40);
    }
  }

  get trainingLogs(): WidgetRegistry<Widget> {
    return this._trainingLogs;
  }

  get packagingLogs(): WidgetRegistry<Widget> {
    return this._packagingLogs;
  }

  private constructTrainingLogWidget(name: string): Widget {
    return new CloudTrainingLogsWidget(
      this._app,
      this.api.cloud,
      name,
      this.apiCloudState,
      {
        defaultRenderHolder: 'odahuflow-cloud-' + name
      }
    );
  }

  private constructPackagingLogWidget(name: string): Widget {
    return new CloudPackagingLogsWidget(
      this._app,
      this.api.cloud,
      name,
      this.apiCloudState,
      {
        defaultRenderHolder: 'odahuflow-cloud-' + name
      }
    );
  }
}

function buildTopMenu(
  commands: CommandRegistry,
  listOfCommands: string[]
): Menu {
  let menu = new Menu({ commands });
  menu.title.label = 'Odahuflow cloud';

  listOfCommands.forEach(command => {
    menu.addItem({ command });
  });

  return menu;
}

/**
 * Activate Odahuflow plugin (build & return OdahuflowExtension, register commands)
 */
function activateCloudPlugin(
  app: JupyterLab,
  mainMenu: IMainMenu,
  restorer: ILayoutRestorer,
  splash: ISplashScreen,
  factory: IFileBrowserFactory,
  launcher: ILauncher | null
): IOdahuflowExtension {
  // Build extension
  let odahuflowExtension = new OdahuflowCloudExtension(
    app,
    restorer,
    mainMenu,
    factory,
    launcher
  );

  odahuflowExtension.apiCloudState.signalLoadingStarted();

  odahuflowExtension.api.configurationApi
    .getCloudConfiguration()
    .then(response => {
      odahuflowExtension.apiCloudState.updateAuthConfiguration(response);

      // Register commands in JupyterLab
      addCloudCommands({
        app,
        config: response,
        services: app.serviceManager,
        state: odahuflowExtension.apiCloudState,
        api: odahuflowExtension.api,
        splash,
        tracker: factory.tracker,
        trainingLogs: odahuflowExtension.trainingLogs,
        packagingLogs: odahuflowExtension.packagingLogs
      });

      if (response.defaultEDIEndpoint.length !== 0) {
        odahuflowExtension.apiCloudState.setCredentials({
          cluster: response.defaultEDIEndpoint,
          authString: null
        });
      } else {
        mainMenu.addMenu(
          buildTopMenu(app.commands, [
            CommandIDs.authorizeOnCluster,
            CommandIDs.unAuthorizeOnCluster
          ])
        );
      }
    })
    .catch(err => {
      odahuflowExtension.apiCloudState.updateAllState();
      showErrorMessage('Can not forcefully update data for cloud mode', err);
    });

  for (let selector of FILE_MANAGER_ODAHUFLOW_RESOURCES) {
    app.contextMenu.addItem({
      command: CommandIDs.applyCloudResources,
      selector: selector,
      rank: APPLY_ODAHUFLOW_RESOURCES
    });
  }

  app.contextMenu.addItem({
    command: CommandIDs.condaUpdateEnv,
    selector: CONDA_FILES,
    rank: CONDA_RESOURCES
  });

  return odahuflowExtension;
}
