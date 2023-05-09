oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g baas-cli
$ baas COMMAND
running command...
$ baas (--version)
baas-cli/0.0.2 linux-x64 node-v16.17.0
$ baas --help [COMMAND]
USAGE
  $ baas COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`baas config edit`](#baas-config-edit)
* [`baas config load [SERVICE]`](#baas-config-load-service)
* [`baas help [COMMANDS]`](#baas-help-commands)
* [`baas import postgres`](#baas-import-postgres)
* [`baas import rabbitmq`](#baas-import-rabbitmq)
* [`baas install`](#baas-install)
* [`baas plugins`](#baas-plugins)
* [`baas plugins:install PLUGIN...`](#baas-pluginsinstall-plugin)
* [`baas plugins:inspect PLUGIN...`](#baas-pluginsinspect-plugin)
* [`baas plugins:install PLUGIN...`](#baas-pluginsinstall-plugin-1)
* [`baas plugins:link PLUGIN`](#baas-pluginslink-plugin)
* [`baas plugins:uninstall PLUGIN...`](#baas-pluginsuninstall-plugin)
* [`baas plugins:uninstall PLUGIN...`](#baas-pluginsuninstall-plugin-1)
* [`baas plugins:uninstall PLUGIN...`](#baas-pluginsuninstall-plugin-2)
* [`baas plugins update`](#baas-plugins-update)

## `baas config edit`

describe the command here

```
USAGE
  $ baas config edit [-s
    backoffice_apis_backoffice-api|dashboard_apis_dashboard-api|services_authentication_api|services_dealer_apis_api|ser
    vices_events_apis_query-api|services_events_workers_new-event|services_exchange_apis_exchange-api|services_exchange_
    workers_buy-transaction-sent|services_exchange_workers_transaction-confirmed|services_exchange_workers_swap-transact
    ion-sent|services_exchange_workers_swap-confirmed|services_internal-wallets_api|services_internal-wallets_jobs_execu
    te-transaction|services_transactions_transactions-api|services_wallet-manager_api_api|services_ctcm_api|services_cas
    h-flow_apis_cash-flow-api|services_cash-flow_jobs_create-balance|support_notifications_api|support_notifications_ema
    il|support_big-gateway|support_digital-bank_api|support_digital-bank_jobs_transaction-send|services_nft_api|services
    _webhooks_api|services_webhooks_workers_send-webhook|services_event-watch_api|services_event-watch_workers_event-wat
    cher|services_telemetry_api|services_telemetry_workers_request-aggregation]

FLAGS
  -s, --serviceName=<option>
      Service you would like to edit config
      <options: backoffice_apis_backoffice-api|dashboard_apis_dashboard-api|services_authentication_api|services_dealer_ap
      is_api|services_events_apis_query-api|services_events_workers_new-event|services_exchange_apis_exchange-api|services
      _exchange_workers_buy-transaction-sent|services_exchange_workers_transaction-confirmed|services_exchange_workers_swa
      p-transaction-sent|services_exchange_workers_swap-confirmed|services_internal-wallets_api|services_internal-wallets_
      jobs_execute-transaction|services_transactions_transactions-api|services_wallet-manager_api_api|services_ctcm_api|se
      rvices_cash-flow_apis_cash-flow-api|services_cash-flow_jobs_create-balance|support_notifications_api|support_notific
      ations_email|support_big-gateway|support_digital-bank_api|support_digital-bank_jobs_transaction-send|services_nft_ap
      i|services_webhooks_api|services_webhooks_workers_send-webhook|services_event-watch_api|services_event-watch_workers
      _event-watcher|services_telemetry_api|services_telemetry_workers_request-aggregation>

DESCRIPTION
  describe the command here

EXAMPLES
  $ baas config edit
```

## `baas config load [SERVICE]`

load cluster config

```
USAGE
  $ baas config load [SERVICE]

DESCRIPTION
  load cluster config
```

## `baas help [COMMANDS]`

Display help for baas.

```
USAGE
  $ baas help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for baas.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.5/src/commands/help.ts)_

## `baas import postgres`

import postgres database

```
USAGE
  $ baas import postgres -h <value> -u <value> -p <value> [-P <value>]

FLAGS
  -P, --port=<value>      [default: 5432]
  -h, --host=<value>      (required)
  -p, --password=<value>  (required)
  -u, --user=<value>      (required)

DESCRIPTION
  import postgres database

EXAMPLES
  $ baas import postgres
```

## `baas import rabbitmq`

```
USAGE
  $ baas import rabbitmq
```

## `baas install`

Install cluster

```
USAGE
  $ baas install

DESCRIPTION
  Install cluster
```

_See code: [dist/commands/install.ts](https://github.com/new/hello-world/blob/v0.0.2/dist/commands/install.ts)_

## `baas plugins`

List installed plugins.

```
USAGE
  $ baas plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ baas plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.3.2/src/commands/plugins/index.ts)_

## `baas plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ baas plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ baas plugins add

EXAMPLES
  $ baas plugins:install myplugin 

  $ baas plugins:install https://github.com/someuser/someplugin

  $ baas plugins:install someuser/someplugin
```

## `baas plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ baas plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ baas plugins:inspect myplugin
```

## `baas plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ baas plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ baas plugins add

EXAMPLES
  $ baas plugins:install myplugin 

  $ baas plugins:install https://github.com/someuser/someplugin

  $ baas plugins:install someuser/someplugin
```

## `baas plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ baas plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ baas plugins:link myplugin
```

## `baas plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ baas plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ baas plugins unlink
  $ baas plugins remove
```

## `baas plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ baas plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ baas plugins unlink
  $ baas plugins remove
```

## `baas plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ baas plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ baas plugins unlink
  $ baas plugins remove
```

## `baas plugins update`

Update installed plugins.

```
USAGE
  $ baas plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
