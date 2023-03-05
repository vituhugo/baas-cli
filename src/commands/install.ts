import {Command} from '@oclif/core'
import * as fs  from 'node:fs'
import {parse} from 'yaml'
import {ROOT_PATH} from '../constants'
import {execSync} from 'node:child_process'

export default class InstallCommand extends Command {
  static description = 'Install cluster'

  async run(): Promise<void> {
    const dockerCompose = parse(fs.readFileSync(`${ROOT_PATH}/docker-compose.yml`).toString())
    const namespaces = Object.keys(dockerCompose.services)
    .map(name => name.replace(/_/gm, '/'))
    for (const namespace of namespaces) {
      const dir = `${ROOT_PATH}/app/${namespace}`
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true})
        try {
          console.log(`Clonando...(${namespace})`)
          execSync(`git clone git@gitlab.com:bitfyapp/baas/${namespace}.git ${dir}`, {stdio: 'ignore'})
        } catch {
          fs.rmdirSync(dir)
          console.log('Você não tem permissão a esse repositório ou o caminho é inválido. \n\t repositório: ' + namespace)
        }
      }
    }
  }
}
