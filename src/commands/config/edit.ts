import {Command, Flags} from '@oclif/core'
import {ROOT_PATH} from '../../constants'
import * as inquirer from 'inquirer'
import * as fs from 'node:fs'
import {parse} from 'yaml'
import * as path from 'node:path'

export default class ConfigEdit extends Command {
  static description = 'describe the command here'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    serviceName: Flags.string({
      char: 's',
      description: 'Service you would like to edit config',
      options: Object.keys(parse(fs.readFileSync(`${ROOT_PATH}/docker-compose.override.yml`).toString()).services),
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(ConfigEdit)

    const {env} = await inquirer.prompt({
      type: 'list',
      name: 'env',
      message: 'Select the config you would like to edit:',
      choices: this.resolveEnvsOptions(flags.serviceName),
    })

    const {editor} = await inquirer.prompt({
      type: 'list',
      name: 'editor',
      message: 'Select the editor you would like to use:',
      choices: ['code', 'vim', 'nano', 'subl', 'atom', 'vscode'],
    })

    const {spawn} = await import('node:child_process')
    spawn(editor, [env], {stdio: 'inherit'})
  }

  private resolveEnvsOptions(serviceName?: string) {
    const dockerCompose = parse(fs.readFileSync(`${ROOT_PATH}/docker-compose.override.yml`).toString())
    serviceName = serviceName ?? this.resolveServiceName(dockerCompose)

    return dockerCompose.services[serviceName].env_file.map((p: string) => ({
      name: `${p.includes('secrets') ? 'secret: ' : 'env: '} ${path.basename(p).replace(/\.env$/, '')}`,
      value: p,
    }))
  }

  private resolveServiceName(dockerCompose: any): string {
    const namespaces = Object.keys(dockerCompose.services)

    const serviceName = namespaces.find((namespace: string) => process.cwd().includes(namespace.replace(/_/g, '/')))
    if (!serviceName) throw new Error('The current folder is not a service root folder')

    return serviceName
  }
}
